<% _.each(config, function(method) { %>
import <%= method.name %> from '<%= method.path %>';<% }); %>

export default function lodash() {
  throw 'lodash chaining is not included in this build. Try rebuilding.';
}
<% _.each(config, function(method) { %>
lodash.<%= method.name %> = <%= method.name %>;<% }); %>