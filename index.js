'use strict';

var fs = require('fs'),
	db = module.parent.require('./database'),
	pkgcloud = require('pkgcloud');
	

(function(rscloudfiles) {
	var rsCloudFilesClientID = '',
	    rsCloudFilesAPIKey = '',
	    rsCloudFilesContainer = '';
	

	db.getObjectField('nodebb-plugin-rscloudfiles', 'rscloudfilesClientID', function(err, id) {
		if(err) {
			return winston.error(err.message);
		}
		rscloudfilesClientID = id;
	});

	rscloudfiles.init = function(app, middleware, controllers, callback) {

		app.get('/admin/plugins/rscloudfiles', middleware.applyCSRF, middleware.admin.buildHeader, renderAdmin);
		app.get('/api/admin/plugins/rscloudfiles', middleware.applyCSRF, renderAdmin);

		app.post('/api/admin/plugins/rscloudfiles/save', middleware.applyCSRF, save);
		callback();
	};
	function renderAdmin(req, res, next) {
		db.getObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesClientID', function(err, rscloudfilesClientID) {
			if (err) {
				return next(err);
			}

			res.render('admin/plugins/rscloudfiles', {rsCloudFilesClientID: rsCloudFilesClientID, csrf: req.csrfToken()});
		});
	}

	function save(req, res, next) {
		if(req.body.rsCloudFilesClientID !== null && req.body.rsCloudFilesClientID !== undefined && 
		req.body.rsCloudFilesAPIKey  !== null && req.body.rsCloudFilesAPIKey !== undefined &&
		req.body.rsCloudFilesContainer  !== null && req.body.rsCloudFilesContainer !== undefined )
		{
			db.setObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesClientID', req.body.rsCloudFilesClientID, function(err) {
				if (err) {
					return next(err);
				}

				rsCloudFilesAPIKey = req.body.rsCloudFilesAPIKey;
			    db.setObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesAPIKey', req.body.rsCloudFilesAPIKey, function(err) {
				    if (err) {
					    return next(err);
			 	    }

				    rsCloudFilesContainer = req.body.rsCloudFilesContainer;
   			        db.setObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesContainer', req.body.rsCloudFilesContainer, function(err) {
				        if (err) {
					        return next(err);
				        }

				        rscloudfilesClientID = req.body.rsCloudFilesContainer;
				        res.json(200, {message: 'Rackspace Redentials saved!'});
			        });
  			    });
			});
		}
	}

	rscloudfiles.upload = function (image, callback) {
		if (!rsCloudFilesClientID) {
			return callback(new Error('invalid-rscloudfiles-client-id'));
		}

		if (!rsCloudFilesAPIKey) {
			return callback(new Error('invalid-rscloudfiles-apikey'));
		}

		if (!rsCloudFilesContainer) {
			return callback(new Error('invalid-rscloudfiles-container'));
		}

		if (!image) {
			return callback(new Error('invalid image'));
		}

		var type = image.url ? 'url' : 'file';

		if (type === 'file' && !image.path) {
			return callback(new Error('invalid image path'));
		}

		var imageData = type === 'file' ? fs.createReadStream(image.path) : image.url;

		uploadToSwift(type, imageData, function(err, data) {
			if (err) {
				return callback(err);
			}

			callback(null, {
				url: data.link.replace('http:', 'https:'),
				name: image.name || ''
			});
		});
	};

	function uploadToSwift(type, image, callback) {

       var filePath = image;

       // create a read stream for our source file
       var source = fs.createReadStream(filePath);

       // create a writeable stream for our destination
       var dest = client.upload({
         container: rsCloudFilesContainer,
         remote: image
       }, function(err) {
         if (err) {
           return callback(err);
           // TODO handle as appropriate
         }
       });

       // pipe the source to the destination
       source.pipe(dest);
   }

	var admin = {};

	admin.menu = function(menu, callback) {
		menu.plugins.push({
			route: '/plugins/rscloudfiles',
			icon: 'fa-picture-o',
			name: 'Rackspace Cloud Files'
		});

		callback(null, menu);
	};

	rscloudfiles.admin = admin;	

}(module.exports));

