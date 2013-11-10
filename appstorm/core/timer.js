/* ************************************************************************

    License: MIT Licence

    Dependencies : [
        a.js
    ]

    Events : [
        a.timer.tick : null (no data)
    ]

    Description:
        Simple timer system, provide a single timer for many bindings

************************************************************************ */

/**
 * Simple timer system, provide a single timer for many bindings
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:timer">here</a>
 *
 * @class timer
 * @static
 * @namespace a
*/
a.timer = (function() {
    'use strict';

    // Internal data
    var delay = 50,
        store = {};

    /**
     * Proceed timer tick
     *
     * @method tick
     * @private
    */
    function tick() {
        // We dispatch a new tick
        a.message.dispatch('a.timer.tick');

        // For every stored function, we scan and apply
        for(var i in store) {
            var obj = store[i];
            obj.current += delay;

            // If it's time to tick
            if(obj.current >= obj.timeout) {
                obj.current = 0;
                if(a.isFunction(obj.fct)) {
                    // Call function on tick OK
                    obj.fct.call(obj.scope || this);
                }
            }
        }
    };

    /**
     * Generate a new random
     *
     * @method generateUniqueId
     * @private
     *
     * @return {Integer}      A new integer generated
    */
    function generateUniqueId() {
        var randomId = Math.floor(Math.random() * 1000000);

        while(!a.isNull(store[randomId])) {
            randomId = Math.floor(Math.random() * 1000000)
        }

        return randomId;
    };

    // Auto-start timer
    setInterval(tick, delay);

    return {
        /**
         * Register a function for regular timer tick
         *
         * @method add
         * @async
         *
         * @param fct {Function}        The function to bind
         * @param scope {Object | null} The scope to use when calling function
         * @param timeout {Integer}     The timeout between two call
         * @return {Integer}            A generated id used to access
         *                              this entry
        */
        add: function(fct, scope, timeout) {
            var id = generateUniqueId();

            if(!a.isNumber(timeout) || timeout <= 0) {
                timeout = 1000;
                a.console.warn('The timeout has not been setted properly ' +
                                    'into timer, timeout has been ' +
                                    'setted to 1000ms', 1);
            }

            // Store the new entry
            store[id] = {
                fct:     fct,
                scope:   scope,
                timeout: timeout,
                current: 0
            };

            // Return the unique id to manipulate it
            return id;
        },

        /**
         * Register a function for a single timer tick
         *
         * @method once
         * @async
         *
         * @param fct {Function}        The function to bind
         * @param scope {Object | null} The scope to use when calling function
         * @param timeout {Integer}     The timeout when calling function
         * @return {Integer}            A generated id used to
         *                              manipulate ticker access
        */
        once: function(fct, scope, timeout) {
            var id = this.add(
                function() {
                    if(a.isFunction(fct)) {
                        fct.call(this);
                    }
                    a.timer.remove(id);
                },
            scope, timeout);
            return id;
        },

        /**
         * Get a function registred into the timer
         *
         * @method get
         *
         * @return {Object | null}      The object linked to id,
         *                              or null if nothing is related to id
        */
        get: function(id) {
            var item = store[id];
            return a.isNull(item) ? null : item;
        },

        /**
         * Remove a function currently stored into the timer
         *
         * @method remove
         *
         * @param id {Integer}         The id to delete
         * @return {Boolean}           The item has been delete or not
        */
        remove : function(id) {
            return delete store[id];
        },

        /**
         * Clear the current timer
         *
         * @method clear
        */
        clear : function() {
            store = {};
        }
    };
})();