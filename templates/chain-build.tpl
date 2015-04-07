import lodash from '<%= lodashPath %>/chain/lodash.js';
import clone from '<%= lodashPath %>/object/clone.js';
import mixin from '<%= lodashPath %>/utility/mixin.js';

<% _.each(config, function(method) { %>
import <%= method.name %> from '<%= method.path %>';<% }); %>

<% _.each(chainMethods, function(method) { %>
import __<%= method.name %>__ from '<%= method.path %>';<% }); %>

var _ = clone(lodash);

// Add the methods used through chaining and explict use
mixin(_, {
  <%= _(config).filter('chained').map('propString').join(',\n  ') %>
}, true);

mixin(_, {
  <%= _(config).reject('chained').map('propString').join(',\n  ') %>
}, true);

<% _.each(chainMethods, function(method) { %>
_.prototype.<%= method.name %> = __<%= method.name %>__;
<% }); %>
export default _;