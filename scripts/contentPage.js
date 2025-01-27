//------------------------------------------------------------------------------
// Copyright (c) 2005, 2006 IBM Corporation and others.
// All rights reserved. This program and the accompanying materials
// are made available under the terms of the Eclipse Public License v1.0
// which accompanies this distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html
// 
// Contributors:
// IBM Corporation - initial implementation
//------------------------------------------------------------------------------

// This temporary function helps to resolve Javascript errors in the migrated RUP
// content pages. It will be removed once the corresponding .js files are being
// migrated along with the HTML content pages.
function ReferenceHelpTopic (topicName, book , fileName) {
   //document.write("<i>"+ topicName + "<\/i>");
};


var contentPage = {

	backPath: null,
	imgPath: null,
	defaultQueryStr: null,
	queryStr: null,
	isProcessPage: false,
	nodeInfo: null,
	
	// define resource file
	res : new ContentPageResource(),
	
	// define activity layout, need to create this as a place holder 
	// so that the dynamically generated data can be loaded
	processPage: ( typeof ProcessElementPage == "undefined" ) ? null : new ProcessElementPage(),
	
	// define section
	section: new ContentPageSection(),
	
	// define sub-section
	subSection: null,
	
	toolbar: null,
	
	// auto wrap elements
	autoWrapElements: [],
	
	// call this method before the page is loaded
	// this is used to initialize some parameters before the page content is processed
	// for example, if the content needs to use some parameters inside the content
	// this approach is not recommented but keep here for backward compatibility
	preload: function(imgPath, backPath, nodeInfo, defaultQueryStr, hasSubSection, isProcessPage, hasTree) {

		this.isProcessPage = isProcessPage || hasTree;
		this.imgPath = imgPath;
		this.backPath = backPath;
		this.nodeInfo = nodeInfo;
		this.defaultQueryStr = defaultQueryStr;
		this.queryStr = location.search;
		
		// convert the image path to absolute path
		// otherwise the page will resolve to wrong absolute path if the browser cashed the pages
		var base = window.location.href;
		var i = base.lastIndexOf("/");
		this.imgPath = base.substring(0, i+1) + this.imgPath;
		//alert(this.imgPath);


		if ( this.queryStr == null || this.queryStr == "" )
		{
			this.queryStr = this.defaultQueryStr;
		}
				
		this.section.init(this.imgPath);
				
		if ( hasSubSection ) {
			this.subSection = new ContentPageSubSection();
		}
		
		if ( this.processPage && (isProcessPage || hasTree) ) {
			this.processPage.init(hasTree);
		}
				
	},
	
	
	// call this method when page is loaded
	onload: function() {
		this.section.createSectionLinks('div', 'sectionHeading', this.imgPath);
		if ( this.subSection != null ) {
			this.subSection.createStepLinks('div', 'stepHeading');
		}
			
		var self = this;
		var app = this.getApp();
		
		if ( app != null ) {
			this.toolbar = new ContentPageToolbar();
			this.toolbar.init(this.imgPath);
		}		
		
		// register auto wrap element
		if ( this.autoWrapElements.length > 0 ) {
			window.onresize = function(e) {
				contentPage.resizeBlockText();
			}		
			this.resizeBlockText();
		}
		
		//alert("content on load: " + location.href);
		
		if ( this.processPage ) {
			this.processPage.onload();
		} 
		
		if ( app != null ) {
			if ( !app.isInitialized() ) {
				var callback = function() {
				//alert("content on load: in callback");
					app.onContentLoaded(location.href);
					self.buildBreadcrumns();
				};
				app.addPostInitCallback(callback);
				
			} else {
				//alert("content on load: calling breadBreadcrumbs");	
				app.onContentLoaded(location.href);
				setTimeout(function () { self.buildBreadcrumns(); }, 10);
			}
		} else {
			this.buildBreadcrumns();
		}
		
		if('ontouchstart' in window){
			this.resizePage();//resize page
			this.addTouchProperty();//for ios iframe scroll
		}
		//alert("content page loaded");
		
		// user can add customization code here
		// this method will be called when the page is loaded
		// this is equivalent to inserting javascript immediately before the </html> tag
		
	},
	
	buildBreadcrumns : function() {
		this._buildBreadcrumns(location.href);
	},
	
	resizeBlockText: function() {
		var newWidth = window.document.body.offsetWidth - 20;
		for ( var i = 0; i < this.autoWrapElements.length; i++ ) {
			var elem = this.autoWrapElements[i];
			elem.style.width=newWidth + "px"; // firefox does not work without specifying the unit
		}
	},
	
	addTouchProperty : function(){//page can't be scroll on IOS,need add -webkit-overflow-scrolling:touch
		var a = window.parent.document.getElementsByClassName("dojoSplitPane");  
		for (var i=0; i<a.length; i++){  
			   a[i].style.webkitOverflowScrolling = "touch";
			   a[i].style.overflow = "auto";
		}  
	},
	
	resizePage : function(){
		//resize the table or div or ... not img tag,only care width
		this.resizeNotImage();
		//resize img,care width&height
		this.resizeImage();
	},
	resizeNotImage :function(){
		var ratio = window.devicePixelRatio;
		if(!ratio){
			ratio = 1;
		}
		maxWidth = window.screen.width/ratio;
		var arrays = document.getElementsByClassName("pageTitle");
		for(i=0;i<arrays.length;i++){
			var ewidth = arrays[i].offsetWidth;
			if(ewidth > maxWidth ){
				arrays[i].setAttribute("width","100%");
				arrays[i].removeAttribute("nowrap");
			}
		}
		
	},
	resizeImage: function(){
		var pic=document.getElementsByTagName('img');
		
		for(i=0;i<pic.length;i++)
		{
			if(pic[i].complete){
				contentPage.autoResizeImage(null,pic[i]);
			}else{
				pic[i].onload = contentPage.autoResizeImage;
			}
		}
	},
	
	autoResizeImage: function (event,objImg) {
		if(event){
			objImg = event.currentTarget;
		}
		var ratio = window.devicePixelRatio;
		if(!ratio){
			ratio = 1;
		}
		maxWidth = window.screen.width/ratio;
		maxHeight = window.screen.height/ratio;
	    var img = new Image();
        img.src = objImg.src;
        var hRatio;
        var wRatio;
        var Ratio = 1;
        var w = objImg.width;
        var h = objImg.height;
        wRatio = maxWidth / w;
        hRatio = maxHeight / h;
        if (maxWidth == 0 && maxHeight == 0) {
            Ratio = 1;
        } else if (maxWidth == 0) { //
            if (hRatio < 1) Ratio = hRatio;
        } else if (maxHeight == 0) {
            if (wRatio < 1) Ratio = wRatio;
        }else if (wRatio < 1 || hRatio < 1){
			Ratio = (wRatio<=hRatio?wRatio:hRatio);
		}
		if (Ratio < 1){
			w = w * Ratio;
			h = h * Ratio;
		}
		if(objImg.getAttribute("usemap")){
			contentPage.autoResizeImageArea(objImg,Ratio);
		}
		objImg.width = w;
		objImg.height = h;
    },
	
	autoResizeImageArea: function(img,ratio){
		if(img.parentNode.getElementsByTagName("map").length>0){
			var map = img.parentNode.getElementsByTagName("map")[0];
			var areas = map.getElementsByTagName("area");
			var coords = "";
			usermap = img.getAttribute("usemap");
			usermap = usermap.substring(1,usermap.length);//rep
			if(areas && usermap.toLowerCase() == map.getAttribute("name").toLowerCase()){
				for(var i=0;i<areas.length;i++){
					area = areas[i];
					coords = area.getAttribute("coords");
					if(coords){
						coordsArray = coords.split(',');
						if(coordsArray){
							for(var j=0;j<coordsArray.length;j++){
								coordsArray[j] = parseInt(coordsArray[j]) * ratio;
								coordsArray[j].toFixed(2);
							}
						}
						area.setAttribute("coords",coordsArray.join(","));
					}
				}
			}
		}
	},
	
	addAutoWrapElement: function(elem) {
		this.autoWrapElements.push(elem);
	},
	
	// utility methods
	getUrlParameters: function(queryStr)
	{
		var arr = new Array();	
		var pairs = queryStr.split("&");
	   	for (var i = 0; i < pairs.length; i++) {
	     		var pos = pairs[i].indexOf('=');
	     		if (pos == -1) continue;
	     		var argname = pairs[i].substring(0,pos);
	     		var value = pairs[i].substring(pos+1);    	
	     		arr[argname] = value;
		}
		
		return arr;
	},

	getApp : function() {
		if( typeof theApp != "undefined") {
			return theApp;
		} else if ( window.parent && typeof window.parent.theApp != "undefined") {
			return window.parent.theApp;
		}
	
		return null;
	},
	
	getViewFrame: function() {
	
		var app = this.getApp();
		if ( app != null ) {
		
			// make sure the app is initialized
			if ( app.isInitialized() ) {
				return app.nav;
			} else { 
				return null;
			}
		}
				
		var viewFrame = null;
		for ( var i = 0; i < window.parent.frames.length; i++ ) {
			if ( window.parent.frames[i].name == 'ory_toc_frame' ) {
				var tocFrame = window.parent.frames[i];
				//alert(tocFrame);
				if (tocFrame.frames.length > 0 ) {
					for ( var x = 0; x < tocFrame.frames.length; x++ ) {
						if (tocFrame.frames[x].name == 'ory_toc' ) {
							viewFrame = tocFrame.frames[x];
							break;
						}
					}
				}
			}
		}
	
		return viewFrame;
	},

	_buildBreadcrumns: function(url) {
		var viewFrame = this.getViewFrame();
		if ( viewFrame == null ) {
			return;
		}else{
			var views = viewFrame.navigationContainer.children;
			//overwrite old method
			if(views != null && views.length > 0){
				for(var i = 0;i < views.length;i++){
					views[i].children[0]._constructBreadcrumb = function(node) {
						if(node.url == null){
							node.url = node.children[0].url;
						}
						return {id: node.objectId, url: node.url, title: node.title, children: node.children, parent: node.parent, iconClass: node.iconNode.attributes[0].value};
					};
				}
			}
		}

		var div = document.getElementById("breadcrumbs");
		if (div != null && viewFrame != null && viewFrame.getBreadcrumbs ) {
			if ( this.getApp() == null ) {
				// don't break old code
				var bcs = viewFrame.getBreadcrumbs(url);
				if ( bcs != null && bcs.length > 0 ) {
					this.showBreadcrumns(div, bcs);
				}
			} else {
				var self = this;
				var callback = function(bcs) {
					if ( bcs != null && bcs.length > 0 ) {
						self.showBreadcrumns(div, bcs);
					}
				};
					
				if (contentPage.nodeInfo != null && contentPage.nodeInfo.length > 0 ) {
					viewFrame.getBreadcrumbsByPath(contentPage.nodeInfo, null, callback);
				} else {
					// do nothing
					//viewFrame.getBreadcrumbs(url, callback);
				}
				
			}
			
		}
	
	},

	loadViewFirstPage: function(viewId){
		parent.theApp.nav.defaultViewId = viewId;
		parent.theApp.nav.selectDefaultPage();
		parent.theApp.nav.defaultViewId = null;
	},
	
	showBreadcrumns: function(div, /*array*/bcs) {
		if (div == null || bcs == null || bcs.length == 0  ) {
			return;
		}
		var baseUrl = this.getApp().getBaseUrl();
		
		this.include_css(baseUrl + "css/css/Nav.css");
		this.include_css(baseUrl + "skin/treeNodesIcons.css");

		var html = ["<div class=\"Nav\" id=\"breadcrumbs-spe\">"];
		html = html.concat(["<li id=\"breadcrumbs-spe-homeicon\">"]);
		
		//create views menu
		var views = this.getApp().nav.treeViews;
		var bcs0Children = bcs[0].parent.children;
		if(bcs0Children == null) return;
		if(views != null && views.length == 1){//only one view,use view's children
			//can't load default page every time,so use first child'page url as home icon's,only one view display view's label
			html = html.concat(["<div class=\"breadcrumbs-home-class-a\"></div>"]);
			html = html.concat(["<a href='", baseUrl + bcs0Children[0].url,"' id=\"breadcrumbs-spe-main\">" , views[0].label , "</a>"]);
			html = html.concat(["<table id=\"breadcrumbs-spe-main-table\"><tr><td>"]);
			for (var j = 0; j < bcs0Children.length; j++ ){
				var par = bcs0Children[j];
				var curl = par.url;
				curl = curl.replace(/'/g, "\\'");
				curl = curl.replace(/\"/g, "\\\"");
				html = html.concat(["<div class=\"",par.iconNode.attributes[0].value,"\"></div>"]);
				html = html.concat(["<a href='", baseUrl + curl , "'>" , par.title , "</a>"]);
			}
			html = html.concat(["</td></tr></table>"]);
		}else if(views != null && views.length > 1){//more than one view
			//can't load default page every time,so use first child'page url as home icon's
			html = html.concat(["<div class=\"breadcrumbs-home-class-a\"></div>"]);
			html = html.concat(["<a href='", baseUrl + bcs0Children[0].url,"' id=\"breadcrumbs-spe-main\"></a>"]);
			html = html.concat(["<table id=\"breadcrumbs-spe-main-table\"><tr><td>"]);
			for (var j = 0; j < views.length; j++ ){
				var view = views[j];
				var csrc = view.src;
				csrc = csrc.replace(/'/g, "\\'");
				csrc = csrc.replace(/\"/g, "\\\"");
				html = html.concat(["<div class=\"",bcs0Children[0].iconNode.attributes[0].value,"\"></div>"]);//use children's icon class
				html = html.concat(["<a href='javascript:void(0);' onclick=\"contentPage.loadViewFirstPage('"+ view.id +"');\">" , view.label , "</a>"]);
			}
			html = html.concat(["</td></tr></table>"]);
		}
		html = html.concat(["</li>"]);
		
		//create parents,more than 1 view,show view breadcrumb
		if(bcs.length > 0 && views != null && views.length > 1){
			html = html.concat(["<li>"]);
			html = html.concat(["<span>></span>"]);
			// escape the quotes
			var url = bcs[0].url;
			url = url.replace(/'/g, "\\'");
			url = url.replace(/\"/g, "\\\"");
			var parentChildren = bcs0Children;
			//use children's icon class
			html = html.concat(["<div class=\"",parentChildren[0].iconNode.attributes[0].value,"\"></div>"]);
			html = html.concat(["<a href=\"#\">", bcs[0].parent.parent.label, "</a>"]);
			//parent's children
			if(parentChildren != null && parentChildren.length > 0){
				html = html.concat(["<table id=\"breadcrumbs-spe-parent\"><tr><td>"]);
				for (var j = 0; j < parentChildren.length; j++ ){
					var par = parentChildren[j];
					var curl = par.url;
					curl = curl.replace(/'/g, "\\'");
					curl = curl.replace(/\"/g, "\\\"");
	 				html = html.concat(["<div class=\"",par.iconNode.attributes[0].value,"\"></div>"]);
					html = html.concat(["<a href='", baseUrl + curl , "'>" , par.title , "</a>"]);
				}
				html = html.concat(["</td></tr></table>"]);
			}
			html = html.concat(["</li>"]);
		}
		
		//same level
		for (var i = 0; i < bcs.length; i++ ) {
			html = html.concat(["<li>"]);
			var bc = bcs[i]; // {url:url, title:title}
			html = html.concat(["<span>></span>"]);
			// escape the quotes
			var url = bc.url;
			url = url.replace(/'/g, "\\'");
			url = url.replace(/\"/g, "\\\"");
			html = html.concat(["<div class=\"",bc.iconClass,"\"></div>"]);
			html = html.concat(["<a href=\"", baseUrl + url, "\">", bc.title, "</a>"]);
			var children = bc.children;
			if(children != null && children.length > 0){
				html = html.concat(["<table><tr><td>"]);
				for (var j = 0; j < children.length; j++ ){
					var child = children[j];
					var curl = child.url;
					curl = curl.replace(/'/g, "\\'");
					curl = curl.replace(/\"/g, "\\\"");
					html = html.concat(["<div class=\"TreeIcon TreeIcon" + child.nodeDocType + "\"></div>"]);
					html = html.concat(["<a href='", baseUrl + curl , "'>" , child.title , "</a>"]);
				}
				html = html.concat(["</td></tr></table>"]);
			}
			html = html.concat(["</li>"]);
		}

		html = html.concat(["</div>"]);
		div.innerHTML = html.join("");
		this.showxBreadcrumbs(div);	
	},		
			
	showxBreadcrumbs: function(element){
			
		var isTouchSupported = 'ontouchstart' in window;
		this.addHideEvent();
		var crumbs = element.querySelectorAll('DIV > LI');
		for(i=0; i<crumbs.length; i++) {
				if (isTouchSupported) {
					crumbs[i].onclick =
					function(evt){			
						table = this.querySelector('table')
						if (table != null) {
							if (table.style.display=="block") {
								table.style.display="none";
							}
							else {
								contentPage.hideOtherDropDowns();
								table.style.display="block"; 
								evt.preventDefault();
							}
						}
					};			
	            }
				else {
					crumbs[i].onmouseover =
					function(evt){					
						table = this.querySelector('table')
						if (table != null) {							
								table.style.display="block"; 
						};
					};
		
	            };
				crumbs[i].onmouseleave =
				function(){
						table = this.querySelector('table')
						if (table != null) {							
								table.style.display="none"; 
						};       
                 };
         
 
            };	
	}, 	

	addHideEvent : function(){
		//click other place ,hide the menu
		var body = document.getElementsByTagName('body')[0];
		for(var c = 0;c<body.children.length;c++){
			if(body.children[c].id != 'breadcrumbs'){
				body.children[c].onclick = function(){
					links = document.getElementById('breadcrumbs-spe').querySelectorAll('DIV > LI > A');
					linksTable = links[0].parentNode.querySelector('table').style.display="none";//hide home icon table
					for(j=1;j<links.length-1;j++){
						linksTable = links[j].parentNode.querySelector('table');
						if(linksTable != null){//the last one has on table,escape
							linksTable.style.display="none";
						}
					}  
				};
			}
		}
	},
	
	hideOtherDropDowns : function(){
		var lis = document.getElementById('breadcrumbs').querySelectorAll('DIV > DIV > LI > TABLE');
		for(j=0;j<lis.length;j++){
			if(lis[j].style.display != "none"){
				lis[j].style.display = "none";
			}
		}
	},
	
	include_css : function(path)   
	{       
	    var fileref=document.createElement("link")   
	    fileref.rel = "stylesheet";  
	    fileref.type = "text/css";  
	    fileref.href = path;   
		var head = document.getElementsByTagName('head')[0];
		head.appendChild(fileref);
	},
	
	resolveUrl: function(url) {

		// note: don't call the app.resolveContenturl() since the content url might not be set yet
		// use the window's url directly
		if ( url.indexOf("./") == 0 ) {			
				var base = window.location.href;
				//alert("base:" + base);
				var i = base.lastIndexOf("/");
				url = base.substring(0, i) + url.substring(1);
		} 
		
		return url;
	},
	
	/* get the page guid, it's the guid of the element or page*/
	getPageId : function() {
		var e = document.getElementById("page-guid");
		if ( e != null ) {
			return e.getAttribute("value");
		}
		
		return null;
	},
	
	saveAsBookmark: function() {
	
         // for IE, does not work for local file browsing
         // only on server

		//var app = this.getApp();
		var url = location.href;
		var title = document.title;			
 		if (window.sidebar) { 
            // for Mozilla Firefox
            window.sidebar.addPanel(title, url, "");
        } else if( window.external ) { 
            window.external.AddFavorite(url, title);
        } else if(window.opera && window.print) { 
             
        }
        
 	},
	
	isFileUrl: function(url) {
		return (url != null) && (url.toLowerCase().indexOf("file://") == 0);
	}
	// helper methods

};
