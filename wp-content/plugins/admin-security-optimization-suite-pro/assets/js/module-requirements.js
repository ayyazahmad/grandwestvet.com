/**
 * Module Requirements Display Helper
 * 
 * Provides functionality to fetch and display module requirements
 * in modal headers using AJAX. Can be called manually or auto-initialize.
 */

const ASOModuleRequirements = {
    /**
     * Display module requirements in a modal
     * 
     * @param {string} modalSelector jQuery selector for the modal
     * @param {string} moduleKey Module key from Module_Registry
     * @param {string} insertSelector Optional jQuery selector for where to insert
     */
    displayRequirements: function( modalSelector, moduleKey, insertSelector ) {
        if ( ! modalSelector || ! moduleKey ) {
            console.warn( 'Module Requirements: Missing modalSelector or moduleKey' );
            return;
        }
        
        const $modal = jQuery( modalSelector );
        if ( $modal.length === 0 ) {
            console.warn( 'Module Requirements: Modal not found:', modalSelector );
            return;
        }
        
        // If insertSelector provided, use it; otherwise look for requirements placeholder
        let $insertPoint = null;
        if ( insertSelector ) {
            $insertPoint = jQuery( insertSelector, $modal );
        } else {
            // Look for requirements placeholder
            $insertPoint = jQuery( '#' + modalSelector.replace('#', '') + '-requirements', $modal );
        }
        
        if ( $insertPoint.length === 0 ) {
            console.warn( 'Module Requirements: Could not find insertion point for module', moduleKey, 'Selector:', insertSelector );
            return;
        }
        
        console.log( 'Module Requirements: Fetching requirements for', moduleKey );
        
        // Fetch requirements via AJAX
        jQuery.ajax( {
            url: ajaxurl || '/wp-admin/admin-ajax.php',
            method: 'POST',
            dataType: 'json',
            data: {
                action: 'aso_get_module_requirements',
                module: moduleKey,
                _wpnonce: jQuery( 'input[name="_wpnonce"]' ).val() || jQuery( '[data-nonce]' ).first().data( 'nonce' ) || ''
            },
            success: function( response ) {
                console.log( 'Module Requirements: AJAX response for', moduleKey, response );
                if ( response.success && response.data && response.data.html ) {
                    // Insert HTML into the placeholder
                    $insertPoint.html( response.data.html );
                    console.log( 'Module Requirements: Successfully inserted HTML for', moduleKey );
                } else {
                    console.warn( 'Module Requirements: No HTML in response for', moduleKey, response );
                }
            },
            error: function( xhr, status, error ) {
                console.error( 'Module Requirements: AJAX error for', moduleKey, 'status:', status, 'error:', error );
                console.error( 'Module Requirements: Response text:', xhr.responseText );
                console.error( 'Module Requirements: Status code:', xhr.status );
                // Try to parse response as JSON to see what's happening
                try {
                    var jsonResponse = JSON.parse( xhr.responseText );
                    console.error( 'Module Requirements: JSON response:', jsonResponse );
                } catch ( e ) {
                    console.error( 'Module Requirements: Response is not valid JSON' );
                }
            }
        } );
    },
    

};

// Make globally available
window.ASOModuleRequirements = ASOModuleRequirements;

