'use strict';

var fs = require('fs'),
	db = module.parent.require('./database'),
	pkgcloud = require('pkgcloud');
	

(function(rscloudfiles) {
	var rsCloudFilesClientID = '',
	    rsCloudFilesAPIKey = '',
	    rsCloudFilesContainer = '',
	    rsCloudFilesRegion,
	    rsCloudFilesCDN,
	    rsCloudFilesCDNSecure;
	

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
	
	db.getObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesCDN', function(err, CDN) {
		if(err) {
			return winston.error(err.message);
		}
		rsCloudFilesCDN = CDN;
	});
	
	db.getObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesCDNSecure', function(err, CDNSecure) {
		if(err) {
			return winston.error(err.message);
		}
		rsCloudFilesCDNSecure = CDNSecure;
	});
	
    rscloudfiles.init = function(params, callback) {
        params.router.get('/admin/plugins/rscloudfiles', params.middleware.applyCSRF, params.middleware.admin.buildHeader, renderAdmin);
        params.router.get('/api/admin/plugins/rscloudfiles', params.middleware.applyCSRF, renderAdmin);

		params.router.post('/api/admin/plugins/rscloudfiles/save', params.middleware.applyCSRF, save);
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

		db.getObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesCDN', function(err, rsCloudFilesCDN) {
			if (err) {
				return next(err);
			}
		});

		db.getObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesCDNSecure', function(err, rsCloudFilesCDNSecure) {
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
		req.body.rsCloudFilesRegion  !== null && req.body.rsCloudFilesRegion !== undefined &&
		req.body.rsCloudFilesCDN  !== null && req.body.rsCloudFilesCDN !== undefined &&
		req.body.rsCloudFilesCDNSecure  !== null && req.body.rsCloudFilesCDNSecure !== undefined  )
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
  				            db.setObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesCDN', req.body.rsCloudFilesCDN, function(err) {
				                if (err) {
					                return next(err);
				                }
				                db.setObjectField('nodebb-plugin-rscloudfiles', 'rsCloudFilesCDNSecure', req.body.rsCloudFilesCDNSecure, function(err) {
    	    			            if (err) {
			        		            return next(err);
				                    }
                                    rsCloudFilesRegion = req.body.rsCloudFilesRegion;
				                    res.json(200, {message: 'Rackspace Credentials saved!'});
				                });
				            });    
  			            });
			        });
  			    });
			});
		}
		else {
		  res.json( 500, { message: 'Somethings wrong with the region' } );
	    }
	}

	rscloudfiles.upload = function ( data, userid, callback) {
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
		
		var image = data.image;

		if (!image) {
			return callback(new Error('invalid image'));
		}

		var type = image.url ? 'url' : 'file';

		if (type === 'file' && !image.path) {
			return callback(new Error('invalid image path: ' + image));
		}

		var imageData = type === 'file' ? fs.createReadStream(image.path) : image.url;

		uploadToSwift(type, imageData, image.originalFilename, function(err, data) {
			if (err) {
				return callback(err);
			}

			callback(null, {
				url: rsCloudFilesCDNSecure + '/' + image.name,
				name: image.name || ''
			});
		});
	};

	function uploadToSwift(type, image, originalName, callback) {

  	   var client = pkgcloud.storage.createClient({
         provider: 'rackspace',
         username: rsCloudFilesClientID,
         apiKey: rsCloudFilesAPIKey,
         region: rsCloudFilesRegion
       }  );

       var filePath = image.path;
       
       // create a read stream for our source file
       var source = fs.createReadStream(filePath);

       // create a writeable stream for our destination
       var dest = client.upload({
         container: rsCloudFilesContainer,
         remote: originalName
       });
  
       dest.on('error', function(err) {
         callback(err, null);
       });

       dest.on('success', function(file) {
         callback( null, file );
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

