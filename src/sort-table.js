import ReportalBase from "r-reporal-base/src/reportal-base";
import TableColumns from "./table-columns";
import SortOrder from "./sort-order";

/**
 * Event reporting that a table has been sorted
 * @event SortTable~reportal-table-sort
 */

/**
 * Makes a table sortable, gives API for sorting. It sorts `data` array, but doesn't move rows in the `source` table, because of differences in implementation.
 *
 * > Note: It's important that every Array item that is going to be sortable was either a `String`, a `Number`, a `null`, or an `Object` that contained `data` property (which was of the previously named types)
 *
 * @param {Object} options - options passed to configure the Sorting
 * @param {HTMLTableElement} options.source - source table sorting will be applied to
 * @param {HTMLTableElement} [options.refSource] - the floating header if any, will reflect and trigger sorting on header when scrolled.
 * @param {Number} [options.defaultHeaderRow=-1] - index of the row in `thead` (incremented from 0) that will have sorting enabled for columns. If `-1` then last row.
 * @param {Array} [options.included] - Array of column indices (incremented from 0) that will have sorting enabled. If not specified, all columns will be sortable. Optionally `excluded` can be specified instead as a shorthand to pass only indices of columns to be excluded from sorting, assumning that others will be made sortable. It's important to count the column index in the defaultHeaderRow
 * @param {Array} [options.excluded] - Array of column indices (incremented from 0) that will be excluded from sorting. Can be used as a shorthand instead of `included`.
 * @param {Object} [options.defaultSorting] - an array of objects that specify default sorting
 * @param {Number} options.defaultSorting.column - column index
 * @param {String} options.defaultSorting.direction - sort direction (`asc`|`desc`)
 * @param {Array} options.data - data with information for rows to be sorted
 * @param {Boolean} [options.multidimensional=false] - if `data` is single-dimensional (contains rows with data to be sorted as immediate array items: `data [rowItem...]`), then it is `false`. If it has blocks of data as items (each block containing an array of rows to be sorted: data [block [rowItem...]...]), then set it to `true`. Currently it supports only a two-level aggregation max (data->block->rowItem).
 * @prop {HTMLTableElement} source - source table
 * @prop {Array} data - data array to be sorted
 * @prop {Boolean} multidimensional - if `data` is single-dimensional (contains rows with data to be sorted as immediate array items: `data [rowItem...]`), then it is `false`. If it has blocks of data as items (each block containing an array of rows to be sorted: data [block [rowItem...]...]), then set it to `true`. Currently it supports only a two-level aggregation max (data->block->rowItem).
 * @prop {SortOrder} sortOrder - instance of {@link SortOrder}
 * @prop {TableColumns} columns - instance of {@link TableColumns} with a modified prototype (added `sortable:true` and `.sortable` to sortable columns)
 * @class SortTable
 * */
class SortTable {
  /**
   *
   *
   *  */

  constructor(options){
    let {source,refSource,defaultHeaderRow=-1,included,excluded,defaultSorting=[],data=[],multidimensional=false}=options;
    this._sortEvent = ReportalBase.newEvent('reportal-table-sort');

    //if(enabled){
      if(source){
        this.source=source;
      } else {
        throw new Error('`source` table is not specified for SortTable');
      }
      this.data = data;
      this.multidimensional = multidimensional;

      //let tableColumns= new TableColumns({source, refSource, defaultHeaderRow});
      // setup sort order and do initial default sorting
      let sortableColumns=SortTable.defineSortableColumns(new TableColumns({source, refSource, defaultHeaderRow}), included, excluded);
      this.columns = sortableColumns;
      this.sortOrder = {sortOrder:[]} = new SortOrder({columns:sortableColumns, sortCallback:this.sort, sortCallbackScope:this, defaultSorting});
      [source,refSource].forEach(src=>{if(src){SortTable.listenForSort(TableColumns.getHeader(src),sortableColumns, this.sortOrder)}});// set up listeners for headers
    //}

    //SortTable.sort(); //initial sorting if any
  }


  /**
   * Checks the table columns array against the `included`/`excluded` columns arrays and adds a `sortable:true` property and a `.sortable` class to the sortable ones
   * @param {TableColumns} columns - an instance of {@link TableColumns}
   * @param {Array} [included] - array of included columns indices
   * @param {Array} [excluded] - array of excluded columns indices
   * */
  static defineSortableColumns(columns, included, excluded){
    let sortableColumns = [].slice.call(columns);
    sortableColumns.forEach((column,index)=>{
      let sortable=((!included && !excluded) || (included && included.indexOf(index)!=-1) || (excluded && excluded.indexOf(index)==-1));
      if(sortable){
        column.cell.classList.add('sortable');
        if(column.refCell){column.refCell.classList.add('sortable');}
        column.sortable = true;
      }
    });
    return sortableColumns
  }

  /**
   * sets up listeners for column headers available for click
   * @param {HTMLElement} delegatedTarget - element that will receive clicks and see if they are valid, `thead` is recommended to boil down to header clicks only
   * @param {TableColumns} columns - array of table columns from {@link SortTable#defineSortableColumns}
   * @param {SortOrder} sortOrder - instance of {@link SortOrder}
   * @listens click
   * */
  static listenForSort(delegatedTarget, columns, sortOrder){
    delegatedTarget.addEventListener('click',e=>{
      // if it's a table cell, is in columns array and is sortable
      let mainCols = columns.filter(col=>col.sortable).map(function(col){return col.cell;}), refCols = columns.filter(col=>col.sortable).map(function(col){return col.refCell;})
      let columnIndex = mainCols.indexOf(e.target)!=-1?mainCols.indexOf(e.target):refCols.indexOf(e.target);
      if((e.target.tagName == 'TD' || e.target.tagName == 'TH') && columnIndex>-1){
        sortOrder.replace({column:columnIndex, direction: e.target.classList.contains('asc')?'desc':'asc'});
      }
    })
  }


  /**
   * Performs channeling of sorting based on whether `this.data` is `multidimensional`
   * @param {SortOrder} sortOrder - instance of {@link SortOrder} passed by the {@link SortOrder#sort} on initial sort
   * @fires SortTable~reportal-table-sort
   * */
  sort(sortOrder){
    let so = sortOrder.sortOrder || this.sortOrder.sortOrder,
      columns = this.columns;
    if(so && so.length>0){
      if(!this.multidimensional){
        SortTable.sortDimension(this.data, columns, so);
      } else { // if array has nested array blocks
        this.data.forEach(dimension=>{
          SortTable.sortDimension(dimension, this.columns, so);
        });
      }
      columns[so[0].column].cell.dispatchEvent(this._sortEvent);
    }
  }
  /**
   * Splits sorting into one-column or two-column. The precedence of columns in `sortOrder` is the factor defining sort priority
   * @param {Array} data - array containing row items to be sorted
   * @param {TableColumns} columns - array of table columns from {@link SortTable#defineSortableColumns}
   * @param {SortOrder} sortOrder - instance of {@link SortOrder}
   * */
  static sortDimension(data,columns,sortOrder){
    let getIndex = (i)=>{return columns[sortOrder[i].column].index};
    let getDirection=(i)=>{return sortOrder[i].direction === 'desc' ? -1 : 1};
    // TODO: add possibility to sort the data that was stripped by column.
    data.sort((a, b)=>{ // sort rows
      if(sortOrder.length==1){ //sort one column only
        return SortTable.sorter( a[getIndex(0)], b[getIndex(0)], getDirection(0) )
      } else { //sort against two columns
        return SortTable.sorter( a[getIndex(0)], b[getIndex(0)], getDirection(0) ) || SortTable.sorter( a[getIndex(1)], b[getIndex(1)], getDirection(1) )
      }
    });
  }

  /**
   * Function that performs case insensitive sorting in the array. It can distinguish between numbers, numbers as strings, HTML and plain strings
   * */
  static sorter(a,b,lesser){
    let regex = /[<>]/g;
    if(regex.test(a) || regex.test(b)){ // if we need to sort elements that have HTML like links
      let tempEl1 = document.createElement('span'); tempEl1.innerHTML = a;
      a=tempEl1.textContent.trim();
      let tempEl2 = document.createElement('span'); tempEl2.innerHTML = b;
      b=tempEl2.textContent.trim();
    }
    if(typeof a=='object' && typeof a.data != undefined){a=a.data}
    if(typeof b=='object' && typeof b.data != undefined){b=b.data}
    if(!isNaN(a) && !isNaN(b)){ //they might be numbers or null
      if(a===null){return 1} else if (b===null){return -1}
      return a <  b ? lesser :  a >  b ? -lesser : 0;
    }
    else if(!isNaN(parseFloat(a)) && !isNaN(parseFloat(b))){ // they might be number strings
      return parseFloat(a) <  parseFloat(b) ? lesser :  parseFloat(a) >  parseFloat(b) ? -lesser : 0;
    } else { //they might be simple strings
      return a.toLowerCase() < b.toLowerCase() ? lesser : a.toLowerCase() > b.toLowerCase() ? -lesser : 0;
    }
  }

}

export default SortTable
