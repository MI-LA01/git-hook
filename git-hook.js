/**
 * Git Hook Event dispatcher 
 * 
 * A git event dispatcher allowing to deploy programatically the any project website 
 * 
 * Currently in 0-1 this daemon allow only to deploy the master. let's see in the futur to implement 
 * new task 
 * 
 * @package unknown
 * 
 * @subpackage deployment and automation using webhooks
 * 
 * @author Alexis Gruet <alexis.gruet@kroknet.com>
 */
try {
	console.log( 'starting as::www-data user' );
    process.setgid( 'www-data' );
    process.setuid( 'www-data' );
} catch( e ){
	console.log( e  )  ;
    process.exit( 1 );
}

/**
 * npm -g install gith chhild_process tar.gz fs rimraf forever
 */
var gith  = require( 'gith' ).create( 9001 )
,   exec  = require( 'child_process' ).exec
,   targz = require( 'tar.gz' )
,   fs    = require( 'fs' )
,   rmdir = require( 'rimraf' )
,   Config = {
	    repo:   'yourname/repo',
		token:  'your token',
		output: '/tmp/master.tar.gz',
		root:   '/var/www/mywebsite',
		target: 'mysubfolder_under_$root',
		api:    'https://api.github.com/repos/$myname/$myproject/tarball/master',
		bin:    '/usr/bin/wget'
	}
;

/**
 * Callback from tar.gz 
 * 
 * @param err As error if any
 */
onExtractedMaster = function( payload, error ) {
	 if( error ) {
	     console.log( 'master::extract::' + error );
	 }
	 console.log( 'master::extract::success' );
	 
	 //TODO - We could implement a rm of the file - however as the archive grabbed remains w/ the same 
	 //name this is not really mandatory. 
	 var master_sha = 
		 	Config.root   + '/' + 
		 	Config.target + '/' + 
		 	'$name-of-folder-in-tar' + payload.sha
	   , master_folder = 
		   Config.root   + '/' + 
		   Config.target + '/' + 
		   '$final_name_under_target'
		   
	 console.log( 'master::extract::original::' + master_sha   );	   
	 console.log( 'master::extract::final::'    + master_folder );	 
	 
	 //delete previous folder
	 rmdir( master_folder, function( error ) {
		 if( error ) {
			 console.log( 'master::extract::remove::' + error );
		 }
		 //rename the file 
		 fs.rename( master_sha, master_folder, 
			  function( o ) {
			  	console.log( 'master::deployed::done' );
			  	//Purge build folder and copy config files. 
		 });
		 
	 });
}

/**
 * This method is fired on exec
 * 
 * @param error
 * 
 * @param stdout
 * 
 * @param stderr
 */
onFetchedMaster = function( payload, error, stdout, stderr ) {
	if ( error !== null ) {
	     console.log( 'master::fetched::error::' + error );
	     
	     return false;
	}  
	console.log( 'master::fetched::success:fetched' );
	
	new targz().extract( Config.output, 
		Config.root + '/' + 
		Config.target, 
		function( error ) { onExtractedMaster( payload, error ); } 
	);
};

/**
 * This event is triggerd on git webhooks 
 * 
 * @param payload
 */
onGitEvent = function( payload ) {
	//
	if( payload.branch === 'master' ) {
    	console.log( 'master::fetching::processing'  ) ;
        child = exec( Config.bin + ' --header="Authorization: token ' 
        	+ Config.token       + '" --output-document=' 
		    + Config.output      + ' ' 
		    + Config.api, 
		//Callback - as we need the payload in the child
		function( error, stdout, stderr ) { onFetchedMaster( payload, error, stdout, stderr ); }  
        );
    }
};

/**
 * Handle !
 */
gith( Config ).on( 'all', onGitEvent );