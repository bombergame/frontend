import Bus from './Bus.js';

class Router {
    constructor() {
        this._routes = {};
        this._currentRoute = null;
        window.addEventListener('popstate', this.popstateCallback.bind(this));
    }

    /**
     * Register a new path
     * @param {string} path - path for the View
     * @param {Class} View - class of the view
     */
    register(path, View) {
        this._routes[path] = {
            View: View,
            viewEntity: null
        };

        return this;
    }


    /**
     * @return {Object}
     * Split pathname to path and page
     * @param {string} path - path for the View
     */
    parsePath(path) {
        let aPath = path.split("/");
        return {path: `/${aPath[1]}`, page: aPath[2]};
    }



    /**
     * @return {Router}
     * Shows view linked with path and push pathname to history
     * @param {string} pathname - path for the View
     */
    open(pathname = "/") {
        this._open(pathname);
        window.history.pushState({lastRoute: pathname}, "", pathname);
        return this;
    }


    /**
     * @return {undefined}
     * Shows view linked with path
     * @param {string} pathname - path for the View
     */
    _open(pathname) {
        let {path, page} = this.parsePath(pathname);
        if (!this._routes[path]) {
            Bus.emit("error", "no such path is registred");
            return;
        }

        let {View, viewEntity} = this._routes[path];

        if (viewEntity === null) {
            viewEntity = new View();
        }

        // if (page) {
        //     Bus.emit("leaderboard-set-page", page);
        // }

        if (!viewEntity.isShown) {
            if (this._currentPath) {
                this._routes[this._currentPath].viewEntity.hide();
            }

            this._currentPath = path;
            viewEntity.show();
        } else if (path === this._currentPath) {
            this.rerender();
        }

        this._routes[path] = {View, viewEntity};
    }

    /**
     * @return {undefined}
     * Allows to redraw open view
     */
    rerender() {
        this._routes[this._currentRoute].viewEntity.show();
    }


    /**
     * @return {String} path for the view
     * Get path for View
     * @param {Class} View View's class
     */
    getPathTo(View) {
        for (let key in Object.getOwnPropertyNames(this._routes)) {
            if (this._routes[key].View === View) {
                return key;
            }
        }
    }

    /**
     * @return {undefined}
     * work with history.api
     * @param {event} event popstate
     */
    popstateCallback(event) {
        event.preventDefault();
        if (event.state.lastRoute) {
            this._open(event.state.lastRoute);
        }
    }

}

export default new Router();
