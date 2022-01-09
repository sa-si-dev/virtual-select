# IE11 compatible example

In order to work under IE11, some polyfills are required
1. [classList-toggle-force-polyfill](https://github.com/orangemug/classlist-toggle-force-polyfill). without this, "click on option" won't work 
2. [custom-event-polyfill](https://github.com/kumarharsh/custom-event-polyfill). without this, IE11 will complain about "new Event": "Object doesn't support this action"
3. [element-closest-polyfill](https://github.com/idmadj/element-closest-polyfill). without this, IE11 will fail on `closet` invoking.
4. [core-js](https://github.com/zloirock/core-js). to polyfill some `es6` functions, like `Object.assign`.

For the classList-toggle-force-polyfill, I didn't find an `unpkg` version, so slightly modified it and included here.  
