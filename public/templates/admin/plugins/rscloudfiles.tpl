<h1>Rackspace Cloud Files</h1>


<form class="form">
	<div class="row">
		<div class="col-sm-4 col-xs-12">
			<div class="form-group">
				<label>Rackspace Cloud User</label>
				<input id="rsCloudFilesClientID" type="text" class="form-control" placeholder="Enter Rackspace Cloud User ID" value="{rsCloudFilesClientID}">
			</div>
			<div class="form-group">
				<label>API Key</label>
				<input id="rsCloudFilesAPIKey" type="text" class="form-control" placeholder="Enter Rackspace Cloud API Key" value="{rsCloudFilesAPIKey}">
			</div>
			<div class="form-group">
				<label>Container/Bucket</label>
				<input id="rsCloudFilesContainer" type="text" class="form-control" placeholder="Enter Rackspace CloudFiles Container to use" value="{rsCloudFilesContainer}">
			</div>
		</div>
	</div>
</form>

<button class="btn btn-primary" id="save">Save</button>

<input id="csrf_token" type="hidden" value="{csrf}" />

<script type="text/javascript">


	$('#save').on('click', function() {

		$.post('/api/admin/plugins/rscloudfiles/save', {_csrf : $('#csrf_token').val(), rsCloudFilesClientID : $('#rsCloudFilesClientID').val(), 
		    rsCloudFilesAPIKey : $('#rsCloudFilesAPIKey').val(), rsCloudFilesContainer : $('#rsCloudFilesContainer').val()}, function(data) {
			app.alertSuccess(data.message);
		});

		return false;
	});

</script>