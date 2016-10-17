/**
 * Created by IvanP on 15.09.2016.
 */
import SortOrder from '../sort-order';
import SortTable from '../sort-table';
import TableColumns from '../table-columns';
import ReportalBase from "r-reporal-base/src/reportal-base";


describe('SortTable', () => {
  var columns, spy, so = {column:1, direction: 'asc'};
  beforeEach(()=>{
    jasmine.getFixtures().fixturesPath = 'base/src/__tests__/fixtures';
    loadFixtures('table-nested-headers.html');
    columns = new TableColumns({source:$j('#confirmit_agg_table')[0],refSource:$j('#confirmit_agg_table')[0]});
    spy={
      callback:function(){}
    };
    spyOn(spy,'callback');

  });

  describe('SortTable.defineSortableColumns',()=>{
    var sortableColumns, included, excluded;
    it('should return an array with all columns being sortable',()=>{
      sortableColumns = SortTable.defineSortableColumns(columns, included, excluded);
      expect(sortableColumns.length).toEqual(columns.length);
      expect(sortableColumns.filter(cell=>cell.sortable==true).length).toEqual(columns.length);
      sortableColumns.forEach(column=>{
        expect($j(column.cell)).toBeMatchedBy('.sortable');
        if(column.refCell)expect($j(column.refCell)).toBeMatchedBy('.sortable');
      });
    });
    it('should accept included array and make sortable only those',()=>{
      included = [0,1];
      sortableColumns = SortTable.defineSortableColumns(columns, included);
      let sortable = sortableColumns.filter(cell=>cell.sortable==true);
      expect(sortable.length).toEqual(2);
      sortable.forEach((column,index)=>{
        expect($j(column.cell)).toBeMatchedBy('.sortable');
        expect(column.index).toEqual(index);
        if(column.refCell){expect($j(column.refCell)).toBeMatchedBy('.sortable');}
      });

      let not_sortable = sortableColumns.filter(cell=>!cell.sortable);
      expect(not_sortable.length).toEqual(columns.length-sortable.length);
      not_sortable.forEach((column,index)=>{
        expect($j(column.cell)).not.toBeMatchedBy('.sortable');
        if(column.refCell){expect($j(column.refCell)).not.toBeMatchedBy('.sortable');}
      });
    });
    it('should accept excluded array and not to make sortable only those',()=>{
      excluded = [0,1];
      sortableColumns = SortTable.defineSortableColumns(columns, undefined, excluded);
      let sortable = sortableColumns.filter(cell=>cell.sortable);
      let not_sortable = sortableColumns.filter(cell=>!cell.hasOwnProperty('sortable'));

      expect(not_sortable.length).toEqual(2);
      expect(sortable.length).toEqual(columns.length-not_sortable.length);
      sortable.forEach((column,index)=>{
        expect($j(column.cell)).toBeMatchedBy('.sortable');
        expect(column.index).toEqual(index+2);
        if(column.refCell){expect($j(column.refCell)).toBeMatchedBy('.sortable');}
      });

      not_sortable.forEach((column,index)=>{
        expect($j(column.cell)).not.toBeMatchedBy('.sortable');
        expect(column.index).toEqual(index);
        if(column.refCell){expect($j(column.refCell)).not.toBeMatchedBy('.sortable');}
      });
    });
  });

  describe('SortTable.sortDimension',()=> {
    var data,sortOrder;
    beforeEach(()=>{
      data = [[10,20,30,40],[10,21,22,12],[10,16,15,5],[11,14,40,41]];
      sortOrder = new SortOrder({columns});
    });
    it('should sort on first column only asc',()=>{
      sortOrder.replace({column:0, direction:'asc'});
      SortTable.sortDimension(data,columns,sortOrder.sortOrder);
      expect(data).toEqual([[11, 14, 40, 41], [10, 20, 30, 40], [10, 21, 22, 12], [10, 16, 15, 5]]);
    });
    it('should sort on first column asc and second column desc',()=>{
      sortOrder.add({column:0, direction:'asc'});
      sortOrder.add({column:1, direction:'desc'});
      SortTable.sortDimension(data,columns,sortOrder.sortOrder);
      expect(data).toEqual([[11, 14, 40, 41], [10, 16, 15, 5], [10, 20, 30, 40], [10, 21, 22, 12]]);
    });

  });

  describe('SortTable.sorter',()=> {

    it('should return 0 for identical numbers descending',()=>{
      let s = SortTable.sorter(5,5,-1);
      expect(s).toEqual(0);
    });
    it('should return 0 for identical numbers ascending',()=>{
      let s = SortTable.sorter(5,5,1);
      expect(s).toEqual(0);
    });
    it('should return 1 for descending sort order',()=>{
      let s = SortTable.sorter(6,5,-1);
      expect(s).toEqual(1);
    });
    it('should return -1 for ascending sort order',()=>{
      let s = SortTable.sorter(6,5,1);
      expect(s).toEqual(-1);
    });
    it('should return -1 for descending sort order',()=>{
      let s = SortTable.sorter(5,6,-1);
      expect(s).toEqual(-1);
    });
    it('should return 1 for ascending sort order',()=>{
      let s = SortTable.sorter(5,6,1);
      expect(s).toEqual(1);
    });
    it('should return 0 for identical numbers descending',()=>{
      let s = SortTable.sorter("5","5",-1);
      expect(s).toEqual(0);
    });
    it('should return 0 for identical numbers ascending',()=>{
      let s = SortTable.sorter("5",5,1);
      expect(s).toEqual(0);
    });
    it('should return 1 for descending sort order',()=>{
      let s = SortTable.sorter(6,"5",-1);
      expect(s).toEqual(1);
    });
    it('should return -1 for ascending sort order',()=>{
      let s = SortTable.sorter("6.1","5.1",1);
      expect(s).toEqual(-1);
    });
    it('should return -1 for descending sort order',()=>{
      let s = SortTable.sorter("5",6.1,-1);
      expect(s).toEqual(-1);
    });
    it('should return 1 for ascending sort order',()=>{
      let s = SortTable.sorter("5","6",1);
      expect(s).toEqual(1);
    });
    it('should return 1 for ascending sort order where a=null',()=>{
      let s = SortTable.sorter(null,5,1);
      expect(s).toEqual(1);
    });
    it('should return 1 for decending sort order where a=null',()=>{
      let s = SortTable.sorter(null,5,-1);
      expect(s).toEqual(1);
    });
    it('should return -1 for ascending sort order where b=null',()=>{
      let s = SortTable.sorter(6,null,1);
      expect(s).toEqual(-1);
    });
    it('should return -1 for decending sort order where b=null',()=>{
      let s = SortTable.sorter(6,null,-1);
      expect(s).toEqual(-1);
    });
    it('should compare strings in html asc',()=>{
      let s = SortTable.sorter('<b>a</b>','<b>b</b>',1);
      expect(s).toEqual(1);
    });
    it('should compare strings in html desc',()=>{
      let s = SortTable.sorter('<b>a</b>','<b>b</b>',-1);
      expect(s).toEqual(-1);
    });
    it('should compare strings in html asc case insensitive',()=>{
      let s = SortTable.sorter('<em>b</em>','<b>A</b>',1);
      expect(s).toEqual(-1);
    });
    it('should compare strings in html desc case insensitive',()=>{
      let s = SortTable.sorter('<b>B</b>','<span>a</span>',-1);
      expect(s).toEqual(1);
    });
    it('should compare strings in html desc case insensitive',()=>{
      let s = SortTable.sorter('<b>B</b>','<span>b</span>',-1);
      expect(s).toEqual(0);
    });

  });

  describe('SortTable.constructor',()=> {
    var data,sortOrder;
    it('should sort on defaultSorting on declaration on two columns',()=>{
      data = [[10,20,30,40],[10,21,22,12],[10,16,15,5],[11,14,40,41]];
      let st = new SortTable({source:$j('#confirmit_agg_table')[0], defaultSorting:[{column:0, direction:'asc'},{column:1, direction:'desc'}], data: data});
      expect(st.data).toEqual([[11, 14, 40, 41], [10, 16, 15, 5], [10, 20, 30, 40], [10, 21, 22, 12]]);
    });
    it('should sort on defaultSorting on declaration on two columns multidimensional arrays',()=>{
      data = [[[10,20,30,40],[10,21,22,12],[10,16,15,5],[11,14,40,41]],[[10,20,30,40],[10,21,22,12],[10,16,15,5],[11,14,40,41]]];
      let st = new SortTable({source:$j('#confirmit_agg_table')[0], defaultSorting:[{column:0, direction:'asc'},{column:1, direction:'desc'}], data: data, multidimensional:true});
      expect(st.data).toEqual([[[11, 14, 40, 41], [10, 16, 15, 5], [10, 20, 30, 40], [10, 21, 22, 12]],[[11, 14, 40, 41], [10, 16, 15, 5], [10, 20, 30, 40], [10, 21, 22, 12]]]);
      st.sortOrder.replace({column:0, direction:'desc'});
    });

  });

  describe('event triggering on a column when clicked and necessary classes being appended',()=>{
    it('should sort on defaultSorting on declaration on two columns multidimensional arrays',()=>{
      let data = [[[10,20,30,40],[10,21,22,12],[10,16,15,5],[11,14,40,41]],[[10,20,30,40],[10,21,22,12],[10,16,15,5],[11,14,40,41]]];
      let st = new SortTable({source:$j('#confirmit_agg_table')[0], data: data, multidimensional:true});
      pending('jquery click clicks two different columns for some weird reason triggering two events, the latter having undefined data. This test to be manual then.');
      var spyEvent = spyOnEvent('thead', 'click');
      $j('.sortable:nth-child(2)').click();
      expect('click').toHaveBeenTriggeredOn('thead');
      expect(spyEvent).toHaveBeenTriggered();
      expect($j('.sortable:nth-child(2)')).toBeMatchedBy('.sorted');
      expect($j('.sortable:nth-child(2)')).toBeMatchedBy('.asc');
      expect(st.data).toEqual([[[10,21,22,12],[10,20,30,40],[10,16,15,5],[11,14,40,41]],[[10,21,22,12],[10,20,30,40],[10,16,15,5],[11,14,40,41]]]);
    });

  });


});
