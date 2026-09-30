/**
 * Verdant Roots theme behaviour. Vanilla JS, no dependencies (WooCommerce's own
 * scripts handle cart fragments, variations and the product gallery).
 */
( function () {
	'use strict';
	var d = document;
	var data = window.vrData || {};
	var i18n = data.i18n || {};
	var $ = function ( s, c ) { return ( c || d ).querySelector( s ); };
	var $$ = function ( s, c ) { return Array.prototype.slice.call( ( c || d ).querySelectorAll( s ) ); };
	var esc = function ( s ) { var e = d.createElement( 'div' ); e.textContent = s; return e.innerHTML; };

	/* ---------------- Toasts ---------------- */
	function toast( message, action ) {
		var box = $( '.vr-toasts' );
		if ( ! box ) { return; }
		var t = d.createElement( 'div' );
		t.className = 'vr-toast';
		t.innerHTML = '<span style="flex:1">' + esc( message ) + '</span>' + ( action ? '<a href="' + esc( action.href ) + '">' + esc( action.label ) + '</a>' : '' );
		box.appendChild( t );
		setTimeout( function () { t.remove(); }, 4500 );
	}

	/* ---------------- Dialogs (menu, search, filters, quick view) ---------------- */
	d.addEventListener( 'click', function ( e ) {
		var opener = e.target.closest( '[data-open]' );
		if ( opener ) {
			var dlg = d.getElementById( opener.getAttribute( 'data-open' ) );
			if ( dlg && dlg.showModal ) {
				dlg.showModal();
				var input = $( '[data-search-input]', dlg );
				if ( input ) { input.focus(); }
			}
		}
		var closer = e.target.closest( '[data-close]' );
		if ( closer ) { var p = closer.closest( 'dialog' ); if ( p ) { p.close(); } }
		if ( e.target.tagName === 'DIALOG' ) { e.target.close(); } // backdrop click
	} );

	/* ---------------- Announcement bar (mobile rotation) ---------------- */
	( function () {
		var el = $( '[data-announce-mobile]' );
		if ( ! el || window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) { return; }
		var list; try { list = JSON.parse( el.getAttribute( 'data-messages' ) ); } catch ( err ) { return; }
		if ( ! list || list.length < 2 ) { return; }
		var i = 0;
		setInterval( function () { i = ( i + 1 ) % list.length; el.textContent = list[ i ]; }, 4000 );
	}() );

	/* ---------------- Mega menu ---------------- */
	( function () {
		var wrap = $( '[data-mega]' );
		if ( ! wrap ) { return; }
		var btn = $( '[data-mega-toggle]', wrap ), panel = $( '#mega-menu', wrap ), timer;
		function set( open ) {
			panel.hidden = ! open;
			btn.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
			wrap.setAttribute( 'data-open', open ? 'true' : 'false' );
		}
		btn.addEventListener( 'click', function () { set( panel.hidden ); } );
		wrap.addEventListener( 'mouseenter', function () { clearTimeout( timer ); set( true ); } );
		wrap.addEventListener( 'mouseleave', function () { timer = setTimeout( function () { set( false ); }, 140 ); } );
		wrap.addEventListener( 'keydown', function ( e ) { if ( e.key === 'Escape' ) { set( false ); btn.focus(); } } );
		wrap.addEventListener( 'focusout', function ( e ) { if ( ! wrap.contains( e.relatedTarget ) ) { set( false ); } } );
	}() );

	/* ---------------- Search: suggestions, recent searches, clear ---------------- */
	var RECENT_KEY = 'vr-recent-searches';
	function recent() { try { return JSON.parse( localStorage.getItem( RECENT_KEY ) || '[]' ); } catch ( err ) { return []; } }
	function saveRecent( term ) {
		if ( ! term ) { return; }
		try { var l = recent().filter( function ( x ) { return x.toLowerCase() !== term.toLowerCase(); } ); l.unshift( term ); localStorage.setItem( RECENT_KEY, JSON.stringify( l.slice( 0, 6 ) ) ); } catch ( err ) { /* storage unavailable */ }
	}
	$$( '[data-search]' ).forEach( function ( root ) {
		var input = $( '[data-search-input]', root ), panel = $( '[data-search-panel]', root ), list = $( '[data-search-list]', root ), clear = $( '[data-search-clear]', root ), form = $( 'form', root );
		var active = -1, ctl, timer, items = [];
		function open( v ) { panel.hidden = ! v; input.setAttribute( 'aria-expanded', v ? 'true' : 'false' ); }
		function render( rows, header, footer ) {
			items = rows; active = -1;
			var html = header || '';
			html += rows.map( function ( r, i ) { return '<li role="option" id="' + list.id + '-' + i + '" aria-selected="false"><a href="' + esc( r.href ) + '" data-saved="' + esc( r.saved || '' ) + '" class="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-brand-50"><span class="flex-1 truncate">' + esc( r.label ) + '</span>' + ( r.hint ? '<span class="text-sm text-ink-soft">' + r.hint + '</span>' : '' ) + '</a></li>'; } ).join( '' );
			list.innerHTML = html + ( footer || '' );
			open( rows.length > 0 || !! footer );
		}
		function showRecent() {
			var r = recent();
			if ( ! r.length ) { open( false ); return; }
			render( r.map( function ( t ) { return { label: t, href: data.shopUrl + '?post_type=product&s=' + encodeURIComponent( t ), saved: t }; } ),
				'<li class="flex items-center justify-between px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-soft" role="presentation">' + esc( i18n.recent || 'Recent searches' ) + '<button type="button" data-clear-recent class="normal-case text-brand-700 hover:underline">' + esc( i18n.clear || 'Clear all' ) + '</button></li>' );
		}
		function suggest( term ) {
			if ( ctl ) { ctl.abort(); }
			ctl = window.AbortController ? new AbortController() : null;
			var opts = ctl ? { signal: ctl.signal } : {};
			Promise.all( [
				fetch( data.restUrl + 'products?per_page=6&search=' + encodeURIComponent( term ), opts ).then( function ( r ) { return r.ok ? r.json() : []; } ),
				fetch( data.restUrl + 'products/categories?per_page=3&search=' + encodeURIComponent( term ), opts ).then( function ( r ) { return r.ok ? r.json() : []; } )
			] ).then( function ( res ) {
				var rows = ( res[ 1 ] || [] ).map( function ( c ) { return { label: c.name.replace( /&amp;/g, '&' ), hint: esc( i18n.category || 'Category' ), href: c.permalink, saved: term }; } )
					.concat( ( res[ 0 ] || [] ).map( function ( p ) {
						var minor = ( p.prices && p.prices.currency_minor_unit ) || 0, price = p.prices ? ( parseInt( p.prices.price, 10 ) / Math.pow( 10, minor ) ) : null;
						return { label: p.name.replace( /&amp;/g, '&' ), hint: price !== null && ! isNaN( price ) ? ( p.prices.currency_prefix || '' ) + price.toLocaleString( 'en-IN' ) : '', href: p.permalink, saved: term };
					} ) );
				var see = '<li role="presentation"><a href="' + esc( data.shopUrl + '?post_type=product&s=' + encodeURIComponent( term ) ) + '" class="block w-full border-t border-line px-4 py-3 text-left text-sm font-semibold text-brand-700 hover:bg-brand-50">' + esc( i18n.seeAll || 'See all results for' ) + ' “' + esc( term ) + '”</a></li>';
				if ( ! rows.length ) {
					list.innerHTML = '<li role="status" class="px-4 py-5 text-center text-sm text-ink-soft">' + esc( i18n.noMatches || 'No matches for' ) + ' “' + esc( term ) + '”.</li>';
					items = []; open( true ); return;
				}
				render( rows, '', see );
			} ).catch( function () { /* aborted or offline: keep the plain form working */ } );
		}
		input.addEventListener( 'focus', function () { if ( input.value.trim().length < 2 ) { showRecent(); } } );
		input.addEventListener( 'input', function () {
			var v = input.value.trim(); clear.hidden = ! input.value;
			clearTimeout( timer );
			if ( v.length < 2 ) { showRecent(); return; }
			timer = setTimeout( function () { suggest( v ); }, 180 );
		} );
		input.addEventListener( 'keydown', function ( e ) {
			var opts = $$( 'li[role=option]', list );
			if ( e.key === 'ArrowDown' || e.key === 'ArrowUp' ) {
				e.preventDefault();
				if ( ! opts.length ) { return; }
				active = e.key === 'ArrowDown' ? Math.min( opts.length - 1, active + 1 ) : Math.max( -1, active - 1 );
				opts.forEach( function ( o, i ) { o.setAttribute( 'aria-selected', i === active ? 'true' : 'false' ); if ( i === active ) { o.style.background = 'var(--color-brand-50)'; } else { o.style.background = ''; } } );
				input.setAttribute( 'aria-activedescendant', active >= 0 ? opts[ active ].id : '' );
			} else if ( e.key === 'Enter' && active >= 0 && opts[ active ] ) {
				e.preventDefault(); var a = $( 'a', opts[ active ] ); saveRecent( a.getAttribute( 'data-saved' ) ); window.location.href = a.href;
			} else if ( e.key === 'Escape' ) { open( false ); }
		} );
		clear.addEventListener( 'click', function () { input.value = ''; clear.hidden = true; input.focus(); showRecent(); } );
		list.addEventListener( 'click', function ( e ) {
			if ( e.target.closest( '[data-clear-recent]' ) ) { try { localStorage.removeItem( RECENT_KEY ); } catch ( err ) { /* ignore */ } open( false ); return; }
			var a = e.target.closest( 'a' ); if ( a ) { saveRecent( a.getAttribute( 'data-saved' ) || input.value.trim() ); }
		} );
		form.addEventListener( 'submit', function () { saveRecent( input.value.trim() ); } );
		root.addEventListener( 'focusout', function ( e ) { if ( ! root.contains( e.relatedTarget ) ) { open( false ); } } );
		clear.hidden = ! input.value;
	} );

	/* ---------------- Quantity +/- ---------------- */
	d.addEventListener( 'click', function ( e ) {
		var b = e.target.closest( '[data-qty]' );
		if ( ! b ) { return; }
		var input = $( 'input.qty', b.parentNode );
		var step = parseFloat( input.step ) || 1, min = parseFloat( input.min ) || 1, max = parseFloat( input.max ) || Infinity;
		var v = ( parseFloat( input.value ) || min ) + step * parseInt( b.getAttribute( 'data-qty' ), 10 );
		input.value = Math.max( min, Math.min( max, v ) );
		input.dispatchEvent( new Event( 'change', { bubbles: true } ) );
	} );

	/* ---------------- Wishlist ---------------- */
	function cookieIds() { var m = d.cookie.match( /(?:^|; )vr_wishlist=([^;]*)/ ); return m ? decodeURIComponent( m[ 1 ] ).split( ',' ).filter( Boolean ).map( Number ) : []; }
	function setCookie( ids ) { d.cookie = 'vr_wishlist=' + encodeURIComponent( ids.join( ',' ) ) + ';path=/;max-age=31536000;SameSite=Lax'; }
	var saved = ( data.loggedIn ? ( data.wishlist || [] ) : cookieIds() ).map( Number );
	function paintWish() {
		$$( '.vr-wish' ).forEach( function ( b ) {
			var on = saved.indexOf( Number( b.getAttribute( 'data-product-id' ) ) ) > -1;
			b.setAttribute( 'aria-pressed', on ? 'true' : 'false' );
			var l = $( '[data-wish-label]', b ); if ( l ) { l.textContent = on ? 'Saved to wishlist' : 'Add to wishlist'; }
			if ( ! l ) { b.setAttribute( 'aria-label', ( on ? 'Remove ' : 'Add ' ) + b.getAttribute( 'data-name' ) + ( on ? ' from wishlist' : ' to wishlist' ) ); }
		} );
		$$( '[data-wish-count]' ).forEach( function ( c ) { c.textContent = saved.length ? String( saved.length ) : ''; } );
	}
	function toggleWish( id ) {
		var idx = saved.indexOf( id ), now = idx === -1;
		if ( now ) { saved.unshift( id ); } else { saved.splice( idx, 1 ); }
		setCookie( saved ); paintWish();
		var body = new URLSearchParams( { action: 'vr_wishlist_toggle', nonce: data.nonce, product_id: id } );
		fetch( data.ajaxUrl, { method: 'POST', body: body, credentials: 'same-origin' } ).catch( function () { /* cookie copy still applies */ } );
		return now;
	}
	d.addEventListener( 'click', function ( e ) {
		var b = e.target.closest( '.vr-wish' );
		if ( b ) {
			var now = toggleWish( Number( b.getAttribute( 'data-product-id' ) ) );
			toast( b.getAttribute( 'data-name' ) + ( now ? ' — ' + ( i18n.added || 'Added to wishlist' ) : ' — ' + ( i18n.removed || 'Removed from wishlist' ) ) );
			return;
		}
		var r = e.target.closest( '.vr-wish-remove' );
		if ( r ) {
			toggleWish( Number( r.getAttribute( 'data-product-id' ) ) );
			var li = r.closest( 'li' ); if ( li ) { li.remove(); }
			var box = $( '#vr-wishlist' );
			if ( box && ! $( '#vr-wishlist ul.products li' ) ) { var em = $( '.vr-wishlist-empty', box ); if ( em ) { em.hidden = false; } }
		}
	} );
	paintWish();

	/* ---------------- Sort select + share + buy now ---------------- */
	$$( '[data-autosubmit]' ).forEach( function ( s ) { s.addEventListener( 'change', function () { s.form.submit(); } ); } );
	d.addEventListener( 'click', function ( e ) {
		var s = e.target.closest( '[data-share]' );
		if ( s ) {
			var url = s.getAttribute( 'data-share' ), title = s.getAttribute( 'data-title' );
			if ( navigator.share ) { navigator.share( { title: title, url: url } ).catch( function () {} ); }
			else if ( navigator.clipboard ) { navigator.clipboard.writeText( url ).then( function () { toast( 'Link copied to clipboard' ); } ); }
		}
		var buy = e.target.closest( '[data-buy-now]' );
		if ( buy ) {
			var form = buy.closest( 'form.cart' ) || $( 'form.cart' );
			if ( ! form ) { return; }
			var h = d.createElement( 'input' ); h.type = 'hidden'; h.name = 'vr_buy_now'; h.value = '1'; form.appendChild( h );
			var main = $( '.single_add_to_cart_button', form ); if ( main && ! main.classList.contains( 'disabled' ) ) { main.click(); } else { form.removeChild( h ); }
		}
	} );
	// Add a "Buy Now" button next to Add to Cart (works for simple + variable products).
	function addBuyNow( scope ) {
		$$( '.single_add_to_cart_button', scope || d ).forEach( function ( main ) {
			if ( main.closest( 'dialog' ) || main.parentNode.querySelector( '[data-buy-now]' ) ) { return; }
			var b = d.createElement( 'button' ); b.type = 'button'; b.className = 'vr-btn vr-btn--buy'; b.setAttribute( 'data-buy-now', '' ); b.style.flex = '1 1 10rem'; b.style.minHeight = '3rem'; b.textContent = 'Buy Now';
			main.parentNode.insertBefore( b, main.nextSibling );
		} );
	}
	addBuyNow();

	/* ---------------- Quick view ---------------- */
	var qv;
	function ensureQv() {
		if ( qv ) { return qv; }
		qv = d.createElement( 'dialog' );
		qv.className = 'vr-modal m-auto w-[calc(100vw-1.5rem)] max-w-4xl max-h-[90dvh] overflow-y-auto rounded-2xl bg-white p-0 text-ink shadow-lift';
		qv.setAttribute( 'aria-labelledby', 'vr-qv-title' );
		qv.innerHTML = '<div class="p-5"><div class="mb-4 flex items-center justify-between gap-4"><h2 id="vr-qv-title" class="text-xl font-semibold"></h2><button type="button" data-close class="grid h-10 w-10 place-items-center rounded-full hover:bg-brand-50" aria-label="Close">✕</button></div><div data-qv-body></div></div>';
		d.body.appendChild( qv );
		return qv;
	}
	d.addEventListener( 'click', function ( e ) {
		var b = e.target.closest( '[data-quick-view]' );
		if ( ! b ) { return; }
		var dlg = ensureQv(), body = $( '[data-qv-body]', dlg );
		$( '#vr-qv-title', dlg ).textContent = '';
		body.innerHTML = '<div class="grid gap-4 sm:grid-cols-2" role="status" aria-label="Loading product"><div class="skeleton aspect-square"></div><div class="space-y-3"><div class="skeleton h-6 w-2/3"></div><div class="skeleton h-4 w-1/3"></div><div class="skeleton h-16"></div></div></div>';
		dlg.showModal();
		fetch( data.ajaxUrl + '?action=vr_quick_view&product_id=' + encodeURIComponent( b.getAttribute( 'data-quick-view' ) ) )
			.then( function ( r ) { return r.ok ? r.json() : Promise.reject(); } )
			.then( function ( res ) {
				if ( ! res.success ) { return Promise.reject(); }
				$( '#vr-qv-title', dlg ).textContent = res.data.title;
				body.innerHTML = res.data.html;
				if ( window.jQuery && window.jQuery.fn.wc_variation_form ) { window.jQuery( body ).find( '.variations_form' ).each( function () { window.jQuery( this ).wc_variation_form(); } ); }
			} )
			.catch( function () { body.innerHTML = '<p class="py-6 text-center text-ink-soft">' + esc( i18n.loadFailed || 'We could not load this product.' ) + '</p>'; } );
	} );

	/* Lock scroll while a dialog is open */
	d.addEventListener( 'toggle', function () {}, true );
	var mo = new MutationObserver( function () { d.body.classList.toggle( 'vr-scroll-lock', !! $( 'dialog[open]' ) ); } );
	$$( 'dialog' ).forEach( function ( x ) { mo.observe( x, { attributes: true, attributeFilter: [ 'open' ] } ); } );

	/* Cart badge accessible label after WooCommerce fragment refresh */
	if ( window.jQuery ) {
		window.jQuery( d.body ).on( 'added_to_cart wc_fragments_refreshed', function ( ev ) {
			var c = $( '.vr-cart-count' );
			if ( c ) { var a = c.closest( 'a' ); if ( a ) { a.setAttribute( 'aria-label', c.getAttribute( 'data-label' ) || 'Cart' ); } }
			if ( ev.type === 'added_to_cart' ) { toast( 'Added to cart', { label: 'View cart', href: ( $( 'a[aria-label^="Cart"]' ) || {} ).href || '/cart' } ); }
		} );
	}
}() );
