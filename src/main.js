/**
 * Created by IvanP on 07.09.2016.
 */
var styles = require('./sort-table-styles.css');

import TableColumns from "./table-columns";
import ReportalBase from "r-reporal-base/src/reportal-base";
import SortOrder from "./sort-order";
import SortTable from "./sort-table";

window.Reportal = window.Reportal || {};
ReportalBase.mixin(window.Reportal,{
  TableColumns,
  SortOrder,
  SortTable
});
