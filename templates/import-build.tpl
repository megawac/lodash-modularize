<% _.each(config, function(method) { %>
import <%= method.name %> from '<%= method.path %>';<% }); %>

export default function() {
  throw 'Chaining is not supported at this time when using the module tool';
};
<% _.each(config, function(method) { %>
lodash.<%= method.name %> = <%= method.name %>;<% }); %>