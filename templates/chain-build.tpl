import lodash from '<%= lodashPath %>/chain/lodash';
import LodashWrapper from '<%= lodashPath %>/internal/LodashWrapper';

import create from '<%= lodashPath %>/object/create';
import mixin from '<%= lodashPath %>/utility/mixin';
<%
// Remove imported modules to prevent err
_(config)
 .reject(_.partial(_.contains, ['create', 'mixin']))
 .each(function(method) { 
%>
import <%= method.name %> from '<%= method.path %>';<% }).value(); %>
<%
_.each(chainMethods, function(method) {
%>
import __<%= method.name %>__ from '<%= method.path %>';<% }); %>

function _(value) {
  if (!(this instanceof _)) {
    return new _(value);
  }
  LodashWrapper.call(this, value);
}
_.prototype = create(lodash.prototype);

// Add the methods used through chaining and explict use
mixin(_, {
  <%= _(config).filter('chained').map('propString').join(',\n  ') %>
}, true);

mixin(_, {
  <%= _(config).reject('chained').map('propString').join(',\n  ') %>
}, false);

<% _.each(chainMethods, function(method) { %>
_.prototype.<%= method.name %> = __<%= method.name %>__;<% }); %>

export default _;