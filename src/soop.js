soop = (function() {
	//These vars are purely for better minification
	var o = Object,
		defineProperty = o.defineProperty,
		getOwnPropertyNames = o.getOwnPropertyNames,
		getOwnPropertyDescriptor = o.getOwnPropertyDescriptor;

	function define(fullName, config) {
		//<debug>
		var c = config.constructor;
		if (!c || typeof(c) != 'function')
			throw new Error('A constructor function must be defined.');
		//</debug>
		setupClassNamespace(fullName, config);
		setupSuperClass(config);
        setupClassInterfaces(config);
		setupClassProperties(config);
	}

	function getNamespaceFromFullName(fullName) {
		var names = fullName.split('.'),
			namespace = window;
		for (var i=0; i<names.length-1; i++) {
			var nextName = names[i];
			if (namespace[nextName])
				namespace = namespace[nextName];
			else
				namespace = namespace[nextName] = {};
		}
		return namespace;
	}

	function setupClassNamespace(fullName, config) {
		var className = getClassNameFromFullName(fullName),
			namespace = getNamespaceFromFullName(fullName);
		//<debug>
		if (namespace[className])
			throw new Error('Class "'+className+'" is already defined.');
		//</debug>
		namespace[className] = config.constructor;
	}

	function setupSuperClass(config) {
		var superClass = config.inherits;
		if (superClass) {
			var c = config.constructor,
				proto = c.prototype = Object.create(superClass.prototype);
			proto.super = superClass;
		}
	}

	function setupClassProperties(config) {
		var	proto = config.constructor.prototype,
			props = getOwnPropertyNames(config);
        for (var i=props.length; i--; ) {
        	var propName = props[i];
        	if (propertyNameIsKeyword(propName))
        		continue;
			var overriddenPropVal = proto[propName];
            defineProperty(proto, propName, getOwnPropertyDescriptor(config, propName));
            if (overriddenPropVal && (proto[propName] instanceof Function))
            	proto[propName].super = overriddenPropVal;
		}
	}

	function propertyNameIsKeyword(propName) {
		return propName == "constructor" ||
			   propName == "inherits" ||
			   propName == "implements";
	}

	function setupClassInterfaces(config) {
		var interfaces = config.implements;
		if (!interfaces)
			return;
		var proto = config.constructor.prototype;
		if (!interfaces.push)
			interfaces = [interfaces];
		for (var iIndex=0; iIndex<interfaces.length; iIndex++ ) {
			var iproto = interfaces[iIndex].prototype,
				iprops = getOwnPropertyNames(iproto);
			for (var ipropIndex=iprops.length; ipropIndex--; ) {
				var ipropName = iprops[ipropIndex];
	            defineProperty(proto, ipropName, getOwnPropertyDescriptor(iproto, ipropName));
	        }
	    }
	}

	function getClassNameFromFullName(fullName) {
		return fullName.substring(fullName.lastIndexOf('.')+1);
	}

	//<debug>
	function undefine(fullName) {
		var className = getClassNameFromFullName(fullName),
			namespace = getNamespaceFromFullName(fullName);
		delete namespace[className];
		if (namespace !== window && Object.keys(namespace).length == 0)
			cleanupNamespace(fullName.substring(0,fullName.lastIndexOf('.')));
	}

	function cleanupNamespace(name) {
		var names = name.split('.'),
			namespaces = [window],
			namespace = window;
		for (var i=0; i<names.length; i++) {
			var nextName = names[i];
			namespace = namespace[nextName];
			namespaces.push(namespace);
		}
		for (var i=namespaces.length; --i; ) {
			var parentNamespace = namespaces[i-1],
				name = names[i-1];
			namespace = namespaces[i];
			if (Object.keys(namespace).length == 0)
				delete parentNamespace[name];
			else
				break;
		}
	}
	//</debug>

	return {
		define: define,
		//<debug>
		undefine: undefine,
		//</debug>
		version: '1.1.0'
	}
})();
