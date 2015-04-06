import lodash from '<%= lodashPath %>/chain/lodash.js';
import clone from '<%= lodashPath %>/object/clone.js';
import mixin from '<%= lodashPath %>/utility/mixin.js';

<% _.each(config, function(method) { %>
import <%= method.name %> from '<%= method.path %>';<% }); %>

<% _.each(chainMethods, function(method) { %>
import __<%= method.name %>__ from '<%= method.path %>';<% }); %>

var _ = clone(lodash);

// Add the methods used through chaining and explict use
<% _.each(config, function(method) { %>
mixin(_, {
  <%= method.name %>: <%= method.name %>
}, <%= method.chained %>);<% }); %>
<% _.each(chainMethods, function(method) { %>
_.prototype.<%= method.name %> = __<%= method.name %>__;
<% }); %>
export default _;