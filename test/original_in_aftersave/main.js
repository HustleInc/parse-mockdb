/* global Parse */

Parse.Cloud.beforeSave('Thing', (req /* , res */) => {
  console.log('BEFORE:',
    req.original !== undefined ? req.original.toJSON() : undefined, '->', req.object.toJSON());
});

Parse.Cloud.afterSave('Thing', (req /* , res */) => {
  console.log('AFTER:',
    req.original !== undefined ? req.original.toJSON() : undefined, '->', req.object.toJSON());
});
