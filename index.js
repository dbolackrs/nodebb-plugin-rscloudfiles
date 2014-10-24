'use strict';

var fs = require('fs'),
	db = module.parent.require('./database'),
	pkgcloud = require('pkgcloud');
	

(function(rscloudfiles) {
	var rsCloudFilesClientID = '',
	    rsCloudFilesAPIKey = '',
	    rsCloudFilesContainer = '',
	    rsCloudFilesRegion;
	

	db.getObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesClientID', function(err, id) {
		if(err) {
			return winston.error(err.message);
		}
		rsCloudFilesClientID = id;
	});

	db.getObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesAPIKey', function(err, apikey) {
		if(err) {
			return winston.error(err.message);
		}
		rsCloudFilesAPIKey = apikey;
	});

	db.getObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesContainer', function(err, container) {
		if(err) {
			return winston.error(err.message);
		}
		rsCloudFilesContainer = container;
	});
	
	db.getObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesRegion', function(err, region) {
		if(err) {
			return winston.error(err.message);
		}
		rsCloudFilesRegion = region;
	});
	
	var client = pkgcloud.storage.createClient({
     provider: 'rackspace',
     username: rsCloudFilesClientID,
     apiKey: rsCloudFilesAPIKey,
     region: rsCloudFilesRegion
    });


	rscloudfiles.init = function(app, middleware, controllers, callback) {

		app.get('/admin/plugins/rscloudfiles', middleware.applyCSRF, middleware.admin.buildHeader, renderAdmin);
		app.get('/api/admin/plugins/rscloudfiles', middleware.applyCSRF, renderAdmin);

		app.post('/api/admin/plugins/rscloudfiles/save', middleware.applyCSRF, save);
		callback();
	};

	function renderAdmin(req, res, next) {
		db.getObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesClientID', function(err, rsCloudFilesClientID) {
			if (err) {
				return next(err);
			}
		});

		db.getObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesAPIKey', function(err, rsCloudFilesAPIKey) {
			if (err) {
				return next(err);
			}
		});

		db.getObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesContainer', function(err, rsCloudFilesContainer) {
			if (err) {
				return next(err);
			}
		});
		db.getObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesRegion', function(err, rsCloudFilesRegion) {
			if (err) {
				return next(err);
			}
		});

		res.render('admin/plugins/rscloudfiles', {rsCloudFilesClientID: rsCloudFilesClientID, rsCloudFilesAPIKey: rsCloudFilesAPIKey, rsCloudFilesContainer: rsCloudFilesContainer, rsCloudFilesRegion: rsCloudFilesRegion, csrf: req.csrfToken()});
	}

	function save(req, res, next) {
		if(req.body.rsCloudFilesClientID !== null && req.body.rsCloudFilesClientID !== undefined && 
		req.body.rsCloudFilesAPIKey  !== null && req.body.rsCloudFilesAPIKey !== undefined &&
		req.body.rsCloudFilesContainer  !== null && req.body.rsCloudFilesContainer !== undefined &&
		req.body.rsCloudFilesRegion  !== null && req.body.rsCloudFilesRegion !== undefined )
  		{
			db.setObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesClientID', req.body.rsCloudFilesClientID, function(err) {
				if (err) {
					return next(err);
				}

		        rsCloudFilesClientID = req.body.rsCloudFilesClientID;
			    db.setObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesAPIKey', req.body.rsCloudFilesAPIKey, function(err) {
				    if (err) {
					    return next(err);
			 	    }

				    rsCloudFilesAPIKey = req.body.rsCloudFilesAPIKey;
   			        db.setObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesContainer', req.body.rsCloudFilesContainer, function(err) {
				        if (err) {
					        return next(err);
				        }
  				        rsCloudFilesContainer = req.body.rsCloudFilesContainer;
   			            db.setObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesRegion', req.body.rsCloudFilesRegion, function(err) {
				            if (err) {
					            return next(err);
				            }
  				            rsCloudFilesRegion = req.body.rsCloudFilesRegion;
				            res.json(200, {message: 'Rackspace Credentials saved!'});
  			            });
			        });
  			    });
			});
		}
		else {
		  res.json( 500, { message: 'Somethings wrong with the region' } );
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

		if (!rsCloudFilesRegion) {
			return callback(new Error('invalid-rscloudfiles-region'));
		}

		if (!image) {
			return callback(new Error('invalid image'));
		}

		var type = image.url ? 'url' : 'file';

		if (type === 'file' && !image.path) {
			return callback(new Error('invalid image path'));
		}

		var imageData = type === 'file' ? fs.createReadStream(image.path) : image.url;

		uploadToSwift(type, imageData, image.originalFilename, function(err, data) {
			if (err) {
				return callback(err);
			}

			callback(null, {
				url: data.link.replace('http:', 'https:'),
				name: image.name || ''
			});
		});
	};

	function uploadToSwift(type, image, originalName, callback) {

       var filePath = image.path;
       
       console.log ( 'FILEPATH: ' + filePath );
       console.log( image );

       // create a read stream for our source file
       var source = fs.createReadStream(filePath);

       // create a writeable stream for our destination
       var dest = client.upload({
         container: rsCloudFilesContainer,
         remote: originalName
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

