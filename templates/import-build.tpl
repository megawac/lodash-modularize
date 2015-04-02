<% _.each(config, function(method) { %>
import <%= method.name %> from '<%= method.path %>';
<% }); %>
export {
  <%= _.map(config, 'name').join(',\n  ') %>
};
