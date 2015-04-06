<% _.each(config, function(method) { %>
import <%= method.name %> from '<%= method.path %>';<% }); %>

export default function() {
  throw 'lodash chaining is not supported in this build. Try rebuilding.';
}
<% _.each(config, function(method) { %>
lodash.<%= method.name %> = <%= method.name %>;<% }); %>