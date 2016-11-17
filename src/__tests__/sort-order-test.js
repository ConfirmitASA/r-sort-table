import SortOrder from '../sort-order';
import TableColumns from 'r-table-columns';


describe('SortOrder', () => {
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
  describe('SortOrder.constructor', () => {
    it('should throw if columns are undefined', () => {
      expect(()=>new SortOrder()).toThrow();
    });
    it('should throw if columns are null', () => {
      expect(()=>new SortOrder({columns:null})).toThrow();
    });
    it('should have columns property', () => {
      let s = new SortOrder({columns});
      expect(s.columns).toBeDefined();
      expect(s.columns).toEqual(columns);
    });
    it('should initialize with a default sorting and call a sorting callback once', () => {
      let s = new SortOrder({columns, sortCallback:spy.callback, sortCallbackScope: spy, defaultSorting:[so]});
      expect(s.sortOrder.length).toEqual(1);
      expect(s.sortOrder[0].column).toEqual(1);
      expect(spy.callback).toHaveBeenCalled();
      expect(spy.callback).toHaveBeenCalledTimes(1);
    });
    it('should initialize with a default sorting and call a default sorting callback once, ignoring the wrong type of callback', () => {
      let s = new SortOrder({columns, sortCallback:{} ,defaultSorting:[so]});
      expect(s.sortOrder.length).toEqual(1);
      expect(s.sortOrder[0].column).toEqual(1);
      expect(spy.callback).not.toHaveBeenCalled();
    });
    it('should add a .sorted.desc class to the 1st column', () => {
      let sortOrder = new SortOrder({columns, sortCallback:spy.callback ,defaultSorting:[so]});
      let cells = sortOrder.getCell(1);
      expect($j(cells[0])).toBeMatchedBy('.sorted');
      expect($j(cells[1])).toBeMatchedBy('.sorted');
      expect($j(cells[0])).toBeMatchedBy('.asc');
      expect($j(cells[1])).toBeMatchedBy('.asc');
    });
  });
  describe('SortOrder.add', () => {
    it('should add a column to the existing setup but not trigger callback', () => {
      let sortOrder= new SortOrder({columns,sortCallback:spy.callback,defaultSorting:[so]});
      expect(sortOrder.sortOrder.length).toEqual(1);
      expect(spy.callback).toHaveBeenCalledTimes(1);
      sortOrder.add({column:2,direction:'desc'});
      expect(sortOrder.sortOrder.length).toEqual(2);
      expect(sortOrder.sortOrder[1].column).toEqual(2);
      expect(spy.callback).toHaveBeenCalledTimes(1);
      let cells = sortOrder.getCell(2);
      expect($j(cells[0])).toBeMatchedBy('.sorted');
      expect($j(cells[1])).toBeMatchedBy('.sorted');
      expect($j(cells[0])).toBeMatchedBy('.desc');
      expect($j(cells[1])).toBeMatchedBy('.desc');

    });
  });
  describe('SortOrder.getCell', () => {
    it('should throw if columnIndex is not passed', () => {
      let sortOrder= new SortOrder({columns,sortCallback:spy.callback,defaultSorting:[so]});
      expect(()=>sortOrder.getCell()).toThrow();
    });
    it('should return only one column', () => {
      let sortOrder= new SortOrder({columns:new TableColumns({source:$j('#confirmit_agg_table')[0]}),sortCallback:spy.callback,defaultSorting:[so]});
      expect(sortOrder.getCell(1).length).toEqual(1);
    });
  });
  describe('SortOrder.replace', () => {
    it('should replace sortOrder[0] with a new object, call a callback and recompute classes', () => {
      let sortOrder= new SortOrder({columns,sortCallback:spy.callback,defaultSorting:[so]});
      expect(spy.callback).toHaveBeenCalledTimes(1);
      let cells = sortOrder.getCell(1);
      expect($j(cells[0])).toBeMatchedBy('.sorted');
      expect($j(cells[1])).toBeMatchedBy('.sorted');
      expect($j(cells[0])).toBeMatchedBy('.asc');
      expect($j(cells[1])).toBeMatchedBy('.asc');

      sortOrder.replace({column:2,direction:'desc'});
      expect(sortOrder.sortOrder.length).toEqual(1);
      expect(sortOrder.sortOrder[0].column).toEqual(2);
      expect(spy.callback).toHaveBeenCalledTimes(2);
      let cells1 = sortOrder.getCell(2);
      expect($j(cells1[0])).toBeMatchedBy('.sorted');
      expect($j(cells1[1])).toBeMatchedBy('.sorted');
      expect($j(cells1[0])).toBeMatchedBy('.desc');
      expect($j(cells1[1])).toBeMatchedBy('.desc');
      expect($j(cells[0])).not.toBeMatchedBy('.sorted');
      expect($j(cells[1])).not.toBeMatchedBy('.sorted');
      expect($j(cells[0])).not.toBeMatchedBy('.asc');
      expect($j(cells[1])).not.toBeMatchedBy('.asc');
    });
    it('should add a new object to sortOrder which is empty, call a callback and compute classes', () => {
      let sortOrder= new SortOrder({columns,sortCallback:spy.callback});
      expect(sortOrder.sortOrder.length).toEqual(0);

      expect(spy.callback).not.toHaveBeenCalled();

      sortOrder.replace({column:2,direction:'desc'});
      expect(sortOrder.sortOrder.length).toEqual(1);
      expect(sortOrder.sortOrder[0].column).toEqual(2);
      expect(spy.callback).toHaveBeenCalledTimes(1);
      let cells1 = sortOrder.getCell(2);
      expect($j(cells1[0])).toBeMatchedBy('.sorted');
      expect($j(cells1[1])).toBeMatchedBy('.sorted');
      expect($j(cells1[0])).toBeMatchedBy('.desc');
      expect($j(cells1[1])).toBeMatchedBy('.desc');
    });
  });
});
