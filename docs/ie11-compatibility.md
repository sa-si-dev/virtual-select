### In order to work under IE11, some polyfills are required

- [classlist-toggle-force-polyfill](https://github.com/orangemug/classlist-toggle-force-polyfill) - without this, "click on option" won't work 
- [custom-event-polyfill](https://github.com/kumarharsh/custom-event-polyfill) - without this, IE11 will complain about "new Event": "Object doesn't support this action"
- [element-closest-polyfill](https://github.com/idmadj/element-closest-polyfill) - without this, IE11 will fail on `closest` invoking
- [core-js](https://github.com/zloirock/core-js) - to polyfill some `es6` functions, like `Object.assign`
