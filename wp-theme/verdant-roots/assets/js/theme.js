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

	/* ---------------- Hero pointer parallax (fine pointers only, never with reduced motion) ---------------- */
	( function () {
		var hero = $( '[data-parallax]' );
		if ( ! hero || ! window.matchMedia( '(pointer: fine)' ).matches || window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) { return; }
		var layers = $$( '[data-depth]', hero ), raf = 0;
		hero.addEventListener( 'pointermove', function ( e ) {
			var r = hero.getBoundingClientRect(), x = ( e.clientX - r.left ) / r.width - 0.5, y = ( e.clientY - r.top ) / r.height - 0.5;
			if ( raf ) { return; }
			raf = requestAnimationFrame( function () {
				raf = 0;
				layers.forEach( function ( l ) { var d = parseFloat( l.getAttribute( 'data-depth' ) ) || 0; l.style.translate = ( x * d ).toFixed( 1 ) + 'px ' + ( y * d ).toFixed( 1 ) + 'px'; } );
			} );
		} );
		hero.addEventListener( 'pointerleave', function () { layers.forEach( function ( l ) { l.style.translate = ''; } ); } );
	}() );

	/* ---------------- Hero 3D coverflow slider ---------------- */
	( function () {
		var root = $( '[data-hs]' );
		if ( ! root ) { return; }
		var slides = $$( '.vr-hs-slide', root ), n = slides.length;
		if ( n < 2 ) { return; }
		var panels = $$( '[data-panel]', d ), dots = $$( '[data-hs-dot]', d ), playBtn = $( '[data-hs-play]', d );
		var reduce = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
		var active = 0, timer = null, userPaused = reduce, hovering = false, drag = null, moved = false;
		var half = Math.floor( n / 2 );

		function render() {
			slides.forEach( function ( s, i ) {
				var o = ( ( i - active + n + half ) % n ) - half, a = Math.abs( o );
				s.style.setProperty( '--o', o ); s.style.setProperty( '--a', a );
				s.classList.toggle( 'is-active', i === active );
				s.setAttribute( 'data-far', a > 2 ? 'true' : 'false' );
				s.setAttribute( 'aria-hidden', i === active ? 'false' : 'true' );
				var link = $( 'a', s ); if ( link ) { link.tabIndex = i === active ? 0 : -1; }
			} );
			panels.forEach( function ( p, i ) { p.hidden = i !== active; } );
			dots.forEach( function ( dt, i ) { dt.setAttribute( 'aria-current', i === active ? 'true' : 'false' ); } );
		}
		function go( i ) { active = ( i + n ) % n; render(); }
		function stopAuto() { clearInterval( timer ); timer = null; }
		function startAuto() { stopAuto(); if ( ! userPaused && ! hovering && ! reduce ) { timer = setInterval( function () { go( active + 1 ); }, 4500 ); } }

		root.classList.add( 'is-ready' );
		$$( '[data-hs-prev],[data-hs-next]', root ).forEach( function ( b ) { b.hidden = false; } );
		render();

		$( '[data-hs-prev]', root ).addEventListener( 'click', function () { go( active - 1 ); startAuto(); } );
		$( '[data-hs-next]', root ).addEventListener( 'click', function () { go( active + 1 ); startAuto(); } );
		dots.forEach( function ( dt ) { dt.addEventListener( 'click', function () { go( parseInt( dt.getAttribute( 'data-hs-dot' ), 10 ) ); startAuto(); } ); } );
		root.addEventListener( 'keydown', function ( e ) {
			if ( e.key === 'ArrowRight' ) { e.preventDefault(); go( active + 1 ); startAuto(); }
			if ( e.key === 'ArrowLeft' ) { e.preventDefault(); go( active - 1 ); startAuto(); }
		} );

		// Click a side card to bring it forward; the active card follows its link.
		root.addEventListener( 'click', function ( e ) {
			if ( moved ) { e.preventDefault(); moved = false; return; }
			var s = e.target.closest( '.vr-hs-slide' );
			if ( s && ! s.classList.contains( 'is-active' ) ) { e.preventDefault(); go( slides.indexOf( s ) ); startAuto(); }
		} );

		// Drag / swipe.
		root.addEventListener( 'pointerdown', function ( e ) { if ( e.button > 0 ) { return; } drag = { x: e.clientX }; moved = false; } );
		window.addEventListener( 'pointermove', function ( e ) {
			if ( ! drag ) { return; }
			var dx = e.clientX - drag.x;
			if ( Math.abs( dx ) > 8 ) { root.classList.add( 'is-dragging' ); }
			if ( Math.abs( dx ) > 48 ) { moved = true; go( active + ( dx < 0 ? 1 : -1 ) ); drag.x = e.clientX; startAuto(); }
		} );
		window.addEventListener( 'pointerup', function () { drag = null; root.classList.remove( 'is-dragging' ); setTimeout( function () { moved = false; }, 0 ); } );

		// 3D tilt on the active card (fine pointers only).
		if ( window.matchMedia( '(pointer: fine)' ).matches && ! reduce ) {
			root.addEventListener( 'pointermove', function ( e ) {
				var s = $( '.vr-hs-slide.is-active', root ); if ( ! s || drag ) { return; }
				var r = s.getBoundingClientRect(), x = ( e.clientX - r.left ) / r.width - 0.5, y = ( e.clientY - r.top ) / r.height - 0.5;
				if ( Math.abs( x ) > 0.9 || Math.abs( y ) > 0.9 ) { return; }
				s.style.setProperty( '--ry', ( x * 16 ).toFixed( 1 ) + 'deg' ); s.style.setProperty( '--rx', ( -y * 12 ).toFixed( 1 ) + 'deg' );
			} );
			root.addEventListener( 'pointerleave', function () { slides.forEach( function ( s ) { s.style.removeProperty( '--rx' ); s.style.removeProperty( '--ry' ); } ); } );
		}

		// Autoplay with a visible pause control (WCAG 2.2.2); paused on hover/focus and when reduced motion is set.
		root.addEventListener( 'mouseenter', function () { hovering = true; stopAuto(); } );
		root.addEventListener( 'mouseleave', function () { hovering = false; startAuto(); } );
		root.addEventListener( 'focusin', function () { hovering = true; stopAuto(); } );
		root.addEventListener( 'focusout', function () { hovering = false; startAuto(); } );
		if ( playBtn ) {
			playBtn.hidden = reduce;
			playBtn.addEventListener( 'click', function () {
				userPaused = ! userPaused;
				playBtn.setAttribute( 'aria-pressed', userPaused ? 'true' : 'false' );
				playBtn.setAttribute( 'aria-label', userPaused ? 'Resume automatic sliding' : 'Pause automatic sliding' );
				$( '[data-hs-play-icon]', playBtn ).textContent = userPaused ? '▶' : '❚❚';
				startAuto();
			} );
		}
		startAuto();
	}() );

	/* ---------------- Trust strip: always running, with a pause control (WCAG 2.2.2) ---------------- */
	( function () {
		var strip = $( '[data-trust]' ), btn = strip && $( '[data-trust-play]', strip );
		if ( ! btn ) { return; }
		btn.addEventListener( 'click', function () {
			var paused = strip.classList.toggle( 'is-paused' );
			btn.setAttribute( 'aria-pressed', paused ? 'true' : 'false' );
			btn.setAttribute( 'aria-label', paused ? 'Resume scrolling strip' : 'Pause scrolling strip' );
			$( '[data-trust-icon]', btn ).textContent = paused ? '▶' : '❚❚';
		} );
	}() );

	/* ---------------- Categories rail: continuous auto-slide that still scrolls by hand ---------------- */
	$$( '[data-crail]' ).forEach( function ( root ) {
		var view = $( '[data-crail-view]', root ), track = $( '[data-crail-track]', root ), group = $( '[data-crail-group]', root );
		var prev = $( '[data-crail-prev]', root ), next = $( '[data-crail-next]', root ), play = $( '[data-crail-play]', root );
		if ( ! view || ! track || ! group ) { return; }
		var reduce = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
		var loopW = 0, pos = 0, last = 0, raf = 0, hold = false, userPaused = false, touching = false, resumeAt = 0, SPEED = 38;

		// Clone the list until it can loop seamlessly, whatever the screen width; clones are decorative and unfocusable.
		function build() {
			$$( '[data-clone]', track ).forEach( function ( c ) { c.remove(); } );
			loopW = group.getBoundingClientRect().width;
			if ( ! loopW ) { return; }
			for ( var n = Math.ceil( view.clientWidth / loopW ) + 1; n > 0; n-- ) {
				var c = group.cloneNode( true );
				c.removeAttribute( 'data-crail-group' ); c.setAttribute( 'data-clone', '' ); c.setAttribute( 'aria-hidden', 'true' ); c.setAttribute( 'inert', '' );
				track.appendChild( c );
			}
		}
		function wrap() { if ( loopW && view.scrollLeft >= loopW ) { view.scrollLeft -= loopW; pos = view.scrollLeft; } else if ( view.scrollLeft < 0 ) { view.scrollLeft += loopW; pos = view.scrollLeft; } }
		function tick( t ) {
			raf = requestAnimationFrame( tick );
			var dt = Math.min( 64, t - last ) / 1000; last = t;
			if ( hold || userPaused || touching || t < resumeAt || d.hidden ) { pos = view.scrollLeft; return; }
			if ( Math.abs( view.scrollLeft - pos ) > 2 ) { pos = view.scrollLeft; } // scrolled from outside (scrollbar, keys): carry on from there.
			pos += SPEED * dt; view.scrollLeft = pos; wrap();
		}
		function start() { if ( reduce || raf ) { return; } last = performance.now(); pos = view.scrollLeft; raf = requestAnimationFrame( tick ); }
		function hide( b ) { if ( b ) { b.hidden = false; } }
		function step( dir ) { var it = $( '.vr-crail-item', group ); var w = it ? it.getBoundingClientRect().width + 20 : 140; resumeAt = performance.now() + 2500; view.scrollBy( { left: dir * w * 2, behavior: reduce ? 'auto' : 'smooth' } ); }

		build();
		var overflow = loopW > view.clientWidth;
		root.classList.add( 'is-ready' );
		hide( prev ); hide( next );
		if ( prev ) { prev.addEventListener( 'click', function () { step( -1 ); } ); }
		if ( next ) { next.addEventListener( 'click', function () { step( 1 ); } ); }
		view.addEventListener( 'scroll', function () { wrap(); }, { passive: true } );
		root.addEventListener( 'mouseenter', function () { hold = true; } );
		root.addEventListener( 'mouseleave', function () { hold = false; } );
		root.addEventListener( 'focusin', function () { hold = true; } );
		root.addEventListener( 'focusout', function () { hold = false; } );
		view.addEventListener( 'pointerdown', function ( e ) { if ( e.pointerType !== 'mouse' ) { touching = true; } } );
		[ 'pointerup', 'pointercancel' ].forEach( function ( ev ) { view.addEventListener( ev, function () { touching = false; resumeAt = performance.now() + 2000; } ); } );
		view.addEventListener( 'wheel', function () { resumeAt = performance.now() + 2000; }, { passive: true } );
		if ( play ) {
			play.hidden = reduce;
			play.addEventListener( 'click', function () {
				userPaused = ! userPaused;
				play.setAttribute( 'aria-pressed', userPaused ? 'true' : 'false' );
				play.setAttribute( 'aria-label', userPaused ? 'Resume automatic sliding' : 'Pause automatic sliding' );
				$( '[data-crail-icon]', play ).textContent = userPaused ? '▶' : '❚❚';
			} );
		}
		var rt; window.addEventListener( 'resize', function () { clearTimeout( rt ); rt = setTimeout( function () { build(); }, 200 ); } );
		start();
	} );

	/* ---------------- Best Selling carousel: arrows scroll by one card; row stays swipeable ---------------- */
	$$( '[data-bsl]' ).forEach( function ( root ) {
		var track = $( '[data-bsl-track]', root ), prev = $( '[data-bsl-prev]', root ), next = $( '[data-bsl-next]', root );
		if ( ! track || ! prev || ! next ) { return; }
		var reduce = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
		function sync() {
			var max = track.scrollWidth - track.clientWidth - 2;
			prev.disabled = track.scrollLeft <= 8; next.disabled = track.scrollLeft >= max - 6;
			prev.hidden = next.hidden = max <= 0; // everything fits: no arrows needed.
		}
		function go( dir ) {
			var slide = $( '.vr-bsl-slide', track ), gap = parseFloat( getComputedStyle( track ).columnGap ) || 0;
			track.scrollBy( { left: dir * ( ( slide ? slide.getBoundingClientRect().width : 260 ) + gap ), behavior: reduce ? 'auto' : 'smooth' } );
		}
		prev.addEventListener( 'click', function () { go( -1 ); } );
		next.addEventListener( 'click', function () { go( 1 ); } );
		track.addEventListener( 'scroll', sync, { passive: true } );
		window.addEventListener( 'resize', sync );
		root.classList.add( 'is-ready' );
		sync();
	} );

	/* ---------------- Featured products: arrows + auto-slide every 5 s (pausable) ---------------- */
	$$( '[data-fp]' ).forEach( function ( root ) {
		var track = $( '[data-fp-track]', root ), prev = $( '[data-fp-prev]', root ), next = $( '[data-fp-next]', root ), play = $( '[data-fp-play]', root );
		if ( ! track ) { return; }
		var reduce = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches, INTERVAL = 5000;
		var timer = 0, hovering = false, focused = false, touching = false, userPaused = false;
		function maxLeft() { return track.scrollWidth - track.clientWidth; }
		function sync() {
			var fits = maxLeft() <= 2;
			if ( prev ) { prev.disabled = track.scrollLeft <= 8; prev.hidden = fits; }
			if ( next ) { next.disabled = track.scrollLeft >= maxLeft() - 6; next.hidden = fits; }
			if ( play ) { play.hidden = fits || reduce; }
		}
		function stepWidth() { var s = $( '.vr-fp-slide', track ), gap = parseFloat( getComputedStyle( track ).columnGap ) || 0; return ( s ? s.getBoundingClientRect().width : 260 ) + gap; }
		function go( dir ) { track.scrollBy( { left: dir * stepWidth(), behavior: reduce ? 'auto' : 'smooth' } ); }
		function advance() {
			if ( hovering || focused || touching || userPaused || d.hidden || maxLeft() <= 2 ) { return; }
			if ( track.scrollLeft >= maxLeft() - 6 ) { track.scrollTo( { left: 0, behavior: reduce ? 'auto' : 'smooth' } ); } else { go( 1 ); }
		}
		function restart() { clearInterval( timer ); timer = 0; if ( ! reduce ) { timer = setInterval( advance, INTERVAL ); } }
		if ( prev ) { prev.addEventListener( 'click', function () { go( -1 ); restart(); } ); }
		if ( next ) { next.addEventListener( 'click', function () { go( 1 ); restart(); } ); }
		track.addEventListener( 'scroll', sync, { passive: true } );
		window.addEventListener( 'resize', sync );
		root.addEventListener( 'mouseenter', function () { hovering = true; } );
		root.addEventListener( 'mouseleave', function () { hovering = false; restart(); } );
		root.addEventListener( 'focusin', function ( e ) { try { focused = e.target.matches( ':focus-visible' ); } catch ( err ) { focused = true; } } );
		root.addEventListener( 'focusout', function () { focused = false; } );
		track.addEventListener( 'pointerdown', function ( e ) { if ( e.pointerType !== 'mouse' ) { touching = true; } } );
		[ 'pointerup', 'pointercancel' ].forEach( function ( ev ) { track.addEventListener( ev, function () { touching = false; restart(); } ); } );
		if ( play ) {
			play.addEventListener( 'click', function () {
				userPaused = ! userPaused;
				play.setAttribute( 'aria-pressed', userPaused ? 'true' : 'false' );
				play.setAttribute( 'aria-label', userPaused ? 'Resume automatic sliding' : 'Pause automatic sliding' );
				$( '[data-fp-icon]', play ).textContent = userPaused ? '▶' : '❚❚';
			} );
		}
		root.classList.add( 'is-ready' );
		sync();
		restart();
	} );

	/* ---------------- Product ad videos: muted loop, play only while on screen, never on data-saver / reduced motion ---------------- */
	( function () {
		var vids = $$( '[data-ad-video]' );
		if ( ! vids.length ) { return; }
		var reduce = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
		var saver = !! ( navigator.connection && navigator.connection.saveData );
		var auto = ! reduce && ! saver; // otherwise the visitor starts a video with the play button.
		var states = [];

		function label( btn, text ) { btn.setAttribute( 'aria-label', text ); }
		vids.forEach( function ( v ) {
			var card = v.closest( '.vr-ad' ), ui = $( '[data-ad-ui]', card ), play = $( '[data-ad-play]', card ), snd = $( '[data-ad-sound]', card ), icon = $( '[data-ad-play-icon]', card );
			var st = { v: v, visible: false, userPaused: ! auto };
			states.push( st );
			v.controls = false; v.muted = true; ui.hidden = false;
			function tryPlay() { var p = v.play(); if ( p && p.catch ) { p.catch( function () {} ); } }
			v.addEventListener( 'play', function () { icon.textContent = '❚❚'; label( play, 'Pause video' ); } );
			v.addEventListener( 'pause', function () { icon.textContent = '▶'; label( play, 'Play video' ); } );
			icon.textContent = '▶'; label( play, 'Play video' );
			play.addEventListener( 'click', function () {
				if ( v.paused ) { st.userPaused = false; tryPlay(); } else { st.userPaused = true; v.pause(); }
			} );
			snd.addEventListener( 'click', function () {
				v.muted = ! v.muted;
				states.forEach( function ( o ) { if ( o.v !== v ) { o.v.muted = true; o.v.closest( '.vr-ad' ).querySelector( '[data-ad-sound]' ).setAttribute( 'aria-pressed', 'false' ); } } );
				snd.setAttribute( 'aria-pressed', v.muted ? 'false' : 'true' );
				label( snd, v.muted ? 'Turn sound on' : 'Turn sound off' );
				if ( ! v.muted && v.paused ) { st.userPaused = false; tryPlay(); }
			} );
		} );

		function sync( st ) { if ( st.visible && ! st.userPaused && ! d.hidden ) { var p = st.v.play(); if ( p && p.catch ) { p.catch( function () {} ); } } else { st.v.pause(); } }
		if ( 'IntersectionObserver' in window ) {
			var io = new IntersectionObserver( function ( entries ) {
				entries.forEach( function ( e ) {
					var st = states.filter( function ( s ) { return s.v === e.target; } )[ 0 ];
					if ( ! st ) { return; }
					if ( e.isIntersecting && st.v.preload === 'none' && ! saver ) { st.v.preload = 'metadata'; }
					st.visible = e.intersectionRatio >= 0.4;
					sync( st );
				} );
			}, { threshold: [ 0, 0.4 ] } );
			states.forEach( function ( s ) { io.observe( s.v ); } );
		}
		d.addEventListener( 'visibilitychange', function () { states.forEach( sync ); } );
	}() );

	/* ---------------- From Our Feed: centred carousel + pop-up YouTube / Instagram player ---------------- */
	$$( '[data-feed]' ).forEach( function ( root ) {
		var track = $( '[data-feed-track]', root ), prev = $( '[data-feed-prev]', root ), next = $( '[data-feed-next]', root );
		var dialog = $( '[data-feed-dialog]', root ), player = $( '[data-feed-player]', root ), closeBtn = $( '[data-feed-close]', root );
		if ( ! track ) { return; }
		var reduce = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches, slides = $$( '.vr-feed-slide', track ), raf = 0, opener = null;
		function maxLeft() { return track.scrollWidth - track.clientWidth; }
		function update() {
			raf = 0;
			var mid = track.scrollLeft + track.clientWidth / 2;
			slides.forEach( function ( s ) { var w = s.offsetWidth || 1; s.style.setProperty( '--f', Math.max( 0, 1 - Math.abs( s.offsetLeft + w / 2 - mid ) / w ).toFixed( 2 ) ); } );
			if ( prev ) { prev.disabled = track.scrollLeft <= 4; prev.hidden = maxLeft() <= 2; }
			if ( next ) { next.disabled = track.scrollLeft >= maxLeft() - 4; next.hidden = maxLeft() <= 2; }
		}
		function queue() { if ( ! raf ) { raf = requestAnimationFrame( update ); } }
		function go( dir ) { var s = slides[ 0 ], gap = parseFloat( getComputedStyle( track ).columnGap ) || 0; track.scrollBy( { left: dir * ( ( s ? s.getBoundingClientRect().width : 240 ) + gap ), behavior: reduce ? 'auto' : 'smooth' } ); }
		if ( prev ) { prev.addEventListener( 'click', function () { go( -1 ); } ); }
		if ( next ) { next.addEventListener( 'click', function () { go( 1 ); } ); }
		track.addEventListener( 'scroll', queue, { passive: true } );
		window.addEventListener( 'resize', queue );
		root.classList.add( 'is-ready' );
		// start with the middle card centred
		if ( slides.length > 2 ) { var m = slides[ Math.floor( ( slides.length - 1 ) / 2 ) ]; track.scrollLeft = m.offsetLeft + m.offsetWidth / 2 - track.clientWidth / 2; }
		update();

		// Pop-up player. The URL is rebuilt from validated parts only (never from the raw link).
		function embedUrl( provider, kind, id ) {
			if ( provider === 'youtube' && /^[A-Za-z0-9_-]{11}$/.test( id ) ) { return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1'; }
			if ( provider === 'instagram' && /^(reel|p|tv)$/.test( kind ) && /^[A-Za-z0-9_-]{5,}$/.test( id ) ) { return 'https://www.instagram.com/' + kind + '/' + id + '/embed/'; }
			return '';
		}
		function closePlayer() { if ( dialog && dialog.open ) { dialog.close(); } }
		if ( dialog && typeof dialog.showModal === 'function' ) {
			$$( '[data-feed-open]', root ).forEach( function ( a ) {
				a.addEventListener( 'click', function ( e ) {
					var src = embedUrl( a.getAttribute( 'data-provider' ), a.getAttribute( 'data-kind' ), a.getAttribute( 'data-id' ) );
					if ( ! src ) { return; } // fall back to the normal link
					e.preventDefault(); opener = a;
					var f = d.createElement( 'iframe' );
					f.src = src; f.title = a.getAttribute( 'aria-label' ) || 'Video'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true; f.referrerPolicy = 'strict-origin-when-cross-origin';
					f.setAttribute( 'loading', 'eager' );
					player.textContent = ''; player.appendChild( f ); player.setAttribute( 'data-provider', a.getAttribute( 'data-provider' ) );
					dialog.showModal();
				} );
			} );
			if ( closeBtn ) { closeBtn.addEventListener( 'click', closePlayer ); }
			dialog.addEventListener( 'click', function ( e ) { if ( e.target === dialog ) { closePlayer(); } } ); // click on the dark backdrop
			dialog.addEventListener( 'close', function () { player.textContent = ''; if ( opener ) { opener.focus(); opener = null; } } ); // removing the iframe stops playback
		}
	} );

	/* ---------------- Offer banner: copy the coupon code ---------------- */
	$$( '[data-offer-copy]' ).forEach( function ( btn ) {
		btn.hidden = false;
		btn.addEventListener( 'click', function () {
			var code = btn.getAttribute( 'data-offer-copy' );
			function done() { toast( ( i18n.codeCopied || 'Code copied' ) + ': ' + code ); btn.textContent = i18n.copied || 'Copied'; setTimeout( function () { btn.textContent = i18n.copy || 'Copy'; }, 2000 ); }
			if ( navigator.clipboard && navigator.clipboard.writeText ) { navigator.clipboard.writeText( code ).then( done, fallback ); } else { fallback(); }
			function fallback() { var t = d.createElement( 'textarea' ); t.value = code; t.setAttribute( 'readonly', '' ); t.style.cssText = 'position:fixed;opacity:0'; d.body.appendChild( t ); t.select(); try { d.execCommand( 'copy' ); done(); } catch ( e ) {} t.remove(); }
		} );
	} );

	/* ---------------- Bulk order form: inline validation + submit without leaving the page ---------------- */
	$$( '[data-bulk]' ).forEach( function ( root ) {
		var form = $( '[data-bulk-form]', root ), done = $( '[data-bulk-done]', root ), doneText = $( '[data-bulk-done-text]', root ), formErr = $( '[data-bulk-error]', root ), btn = $( '[data-bulk-submit]', root );
		if ( ! form ) { return; }
		var names = [ 'business', 'contact', 'mobile', 'email', 'state', 'city', 'type', 'qty', 'date', 'details', 'via' ];
		function setErr( name, msg ) {
			var p = $( '#vrb_' + name + '_err', root ), field = $( '[data-field="' + name + '"]', root ), input = $( '[name="vrb_' + name + '"]', root );
			if ( p ) { p.textContent = msg || ''; p.hidden = ! msg; }
			if ( field ) { if ( msg ) { field.setAttribute( 'data-invalid', '' ); } else { field.removeAttribute( 'data-invalid' ); } }
			if ( input && input.type !== 'radio' ) { if ( msg ) { input.setAttribute( 'aria-invalid', 'true' ); input.setAttribute( 'aria-describedby', 'vrb_' + name + '_err' ); } else { input.removeAttribute( 'aria-invalid' ); } }
		}
		function clearAll() { names.forEach( function ( n ) { setErr( n, '' ); } ); formErr.hidden = true; formErr.textContent = ''; }
		function localCheck() {
			var errs = {}, v = function ( n ) { var el = $( '[name="vrb_' + n + '"]', root ); return el ? el.value.trim() : ''; };
			[ 'business', 'contact', 'mobile', 'email', 'type', 'qty', 'date' ].forEach( function ( n ) { if ( ! v( n ) ) { errs[ n ] = i18n.required || 'This field is required.'; } } );
			if ( ! errs.mobile ) { var dg = v( 'mobile' ).replace( /\D+/g, '' ); if ( dg.length === 12 && dg.indexOf( '91' ) === 0 ) { dg = dg.slice( 2 ); } else if ( dg.length === 11 && dg.charAt( 0 ) === '0' ) { dg = dg.slice( 1 ); } if ( ! /^[6-9]\d{9}$/.test( dg ) ) { errs.mobile = 'Enter a valid 10-digit mobile number.'; } }
			if ( ! errs.email && ! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( v( 'email' ) ) ) { errs.email = 'Enter a valid email address.'; }
			if ( ! errs.qty && ! /\d/.test( v( 'qty' ) ) ) { errs.qty = 'Include a number, for example 50 or 25 kg.'; }
			return errs;
		}
		function show( errs ) {
			var first = null;
			names.forEach( function ( n ) { if ( errs[ n ] ) { setErr( n, errs[ n ] ); first = first || n; } } );
			if ( first ) { var el = $( '[name="vrb_' + first + '"]', root ); if ( el ) { el.focus(); } }
			return !! first;
		}
		form.addEventListener( 'input', function ( e ) { var n = ( e.target.name || '' ).replace( 'vrb_', '' ); if ( n ) { setErr( n, '' ); } } );
		form.addEventListener( 'submit', function ( e ) {
			if ( ! window.fetch || ! window.FormData ) { return; } // no fetch: the normal form post still works.
			e.preventDefault(); clearAll();
			var local = localCheck(); if ( show( local ) ) { return; }
			var label = $( 'span', btn ), old = label.textContent; btn.disabled = true; label.textContent = i18n.sending || 'Sending…';
			fetch( form.getAttribute( 'action' ), { method: 'POST', body: new FormData( form ), headers: { Accept: 'application/json' }, credentials: 'same-origin' } )
				.then( function ( r ) { return r.json().catch( function () { return { ok: false, message: 'Something went wrong. Please try again.' }; } ); } )
				.then( function ( res ) {
					if ( res && res.ok ) { form.hidden = true; doneText.textContent = res.message; done.hidden = false; done.focus(); done.scrollIntoView( { block: 'center' } ); return; }
					var errs = res && res.errors ? res.errors : {};
					if ( ! show( errs ) ) { formErr.textContent = ( res && res.message ) || 'Something went wrong. Please try again.'; formErr.hidden = false; }
				} )
				.catch( function () { formErr.textContent = 'Network problem. Please check your connection and try again.'; formErr.hidden = false; } )
				.then( function () { btn.disabled = false; label.textContent = old; } );
		} );
	} );

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
