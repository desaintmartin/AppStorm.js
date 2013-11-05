/* ************************************************************************

    License: MIT Licence

    Authors: VILLETTE Charles

    Date: 2013-05-10

    Date of last modification: 2013-10-11

    Dependencies : [
        a.js
    ]

    Events : []

    Description:
        Console functionnality, the system will automatically choose what kind of console is acceptable or not

************************************************************************ */


/**
 * wrapper for system console, allowing to use console even if there is not console support on given browser.
 * Also, it does provide a trace utility in case of bug/check
 *
 * Examples: <a href="http://appstormjs.com/wiki/doku.php?id=appstorm.js_v0.1:core:console">here</a>
 *
 * @class console
 * @static
 * @namespace a
*/
a.console = (function() {
    'use strict';

    // Locally store a copy of the messages
    var logData = {error: [], info: [], log: [], warn: []};

    /**
     * Determine if current level is significant compared to the "verbosity"
     * defined by the enviromnent.
     *
     * @method isToBeLogged
     * @private
     *
     * @param level {String} The log level, like "log", "warn", "info", "error", inspired from window.console levels.
     *
     * @ return True if message should be logged, false otherwise.
     */
    function isToBeLogged(level) {
        // If no console, or log level, we allow all
        switch (a.environment.get('console')) {
        case 'error':
            if (level !== 'error') {
                return false;
            }
            /* falls through */
        case 'warning':
            /* falls through */
        case 'warn':
            if (level !== 'warn' && level !== 'error') {
                return false;
            }
            /* falls through */
        case 'info':
            if (level === 'log') {
                return false;
            }
            /* falls through */
        default:
            break;
        }
        return true;
    }

    /**
     * Takes a log message, analyze its namespace if any:
     * If message looks like "foo.bar.baz: some message to output":
     * Look for a specific "verbose" option in current namespace
     * (foo.bar.baz) then, if not found, look upward (foo.bar, foo).
     * Finally, if no found, check "root" namespace, i.e environment
     *
     * @method checkNamespaceVerbosePriority
     * @private
     *
     * @param message {Mixed} The message to output
     *
     * @return The nearest "verbose" option in the namespace
    */
    function getNamespaceVerbosePriority(message) {
        // We should raise if message is not a string.
        if(a.isString(message) && message.indexOf(":") >= 0) {
            var name = message.substr(0, message.indexOf(":")),
                namespaceList = name.split(".");

            while(namespaceList.length > 0) {
                var namespacePriority = a.environment.get("verbose-" + namespaceList.join("."));

                if(!a.isNull(namespacePriority)) {
                    return namespacePriority;
                }

                // We don't find any, we go one level up
                namespaceList.pop();
            }
        }
        // Not found in namespace? Check root
        var environmentPriority = a.environment.get('verbose');
        if (!a.isNull(environmentPriority)) {
            return parseInt(environmentPriority, 10);
        }
    }

    /**
     * Print a message to console if it matches level and priority defined
     * by the environment.
     * Print the message only if:
     * 1/ Message level is high enough compared to environment configuration
     * 2/ verbosity is high enough compared to environment configuration
     *
     * @method printToConsole
     * @private
     *
     * @param level {String} The log level, like "log", "warn", "info", "error", inspired from window.console levels.
     * @param message {Mixed} The message to output
     * @param priority {Integer | null} Indicate the message priority level, can be null
     *
    */
    function printToConsole(message, level, priority) {
        // Bug: IE does not support testing variable existence if they are not
        // scopped with the root (here window)
        if (!(!a.isNull(window.console) && a.isFunction(window.console.log))) {
            return;
        }
        if (!isToBeLogged(level)) {
            return;
        }

        var namespaceVerbosePriority = getNamespaceVerbosePriority(message);
        if (!a.isNull(priority) && namespaceVerbosePriority && priority < namespaceVerbosePriority) {
            return;
        }

        window.console[level](message);
    }

    /**
     * Output to console if possible and store given message.
     * the content will be stored into object, the list function allow to
     * access stored content in this case.
     *
     * @method log
     * @private
     *
     * @param level {String} The log level, like "log", "warn", "info", "error", inspired from window.console levels.
     * @param message {Mixed} The message to output
     * @param priority {Integer | null} Indicate the message priority level, can be null
     * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
    */
    function log(level, message, priority, appear) {
        // Rollback to log in case of problem (level parameter being incorrect)
        if (!a.isArray(logData[level])) {
            level = 'log';
        }
        logData[level].push(message);

        if (appear !== false) {
            printToConsole(message, level, priority);
        }

        // If data exceed limit, we remove some
        while (logData[level].length > 2000) {
            logData[level].shift();
        }
    }


    return {
        /**
         * Log data
         *
         * @method log
         *
         * @param message {Mixed} The message to log on debug
         * @param priority {Integer | null} Indicate the message priority level, can be null
         * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
        */
        log: function(message, priority, appear) { log('log', message, priority, appear); },

        /**
         * Warning data
         *
         * @method warn
         *
         * @param message {Mixed} The message to warning on debug
         * @param priority {Integer | null} Indicate the message priority level, can be null
         * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
        */
        warn: function(message, priority, appear) { log('warn', message, priority, appear); },

        /**
         * Information data
         *
         * @method info
         *
         * @param message {Mixed} The message to inform on debug
         * @param priority {Integer | null} Indicate the message priority level, can be null
         * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
        */
        info: function(message, priority, appear) { log('info', message, priority, appear); },

        /**
         * Error data
         *
         * @method error
         *
         * @param message {Mixed} The message to error on debug
         * @param priority {Integer | null} Indicate the message priority level, can be null
         * @param appear {Boolean | null} Indicate if the console should handle or not the message (mostly used for unit test...)
        */
        error: function(message, priority, appear) { log('error', message, priority, appear); },

        /**
         * List all currently stored content
         *
         * @method trace
         *
         * @param level {String | null} The string type (can be null)
         * @return The stored data, the object got 4 properties : log, info, warn, error
        */
        trace: function(level) {
            return (a.isString(level) && level in logData) ? logData[level] : logData;
        },

        /**
         * Clear the stored content
         *
         * @method clear
        */
        clear: function() {
            logData = {log: [], warn: [], info: [], error: []};
        }
    };
}());
