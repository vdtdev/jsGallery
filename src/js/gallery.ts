/// <reference path="libs/jquery.d.ts"/>

namespace JsGallery {

	enum MediaType {
		IMAGE,
		AUDIO,
		VIDEO
	};
	
	
	export class GallerySystem {

		private galleries: Array<JsGallery.Gallery>;
		private manifestUrl: string;
		private manifestData: Object = {};
		private settings: Object = { galleryPath: "", container: null };
		
		/**
		 * Callback for loadManifest that handles processing the contents of
		 * the JsGallery system manifest file
		 */
		private processManifest(kind: string, data: Object) {
			this.manifestData = data;
			this.galleries = new Array<JsGallery.Gallery>();
			if (data.hasOwnProperty('galleryPath')) {
				this.settings['galleryPath'] = data['galleryPath'];
			}
			if (data.hasOwnProperty("galleries")) {
				for (var i = 0; i < data['galleries'].length; i++) {
					var src = data['galleries'][i];
					var tmp: Gallery = new Gallery(
						Utils.pathJoin(this.settings['galleryPath'], src['manifest']), src['id'], this.settings['container']
					);
					this.galleries.push(tmp);
				}
			}
		}

		constructor(systemManifest: string, containerSelector: string) {
			this.manifestUrl = systemManifest;
			this.settings['container'] = containerSelector;
			Config.loadManifest(systemManifest, this.processManifest);
		}

	}


	export module Config {
		export function loadManifest(manifestUrl: string, callback: Function) {
			jQuery.getJSON(manifestUrl, function(data) {
				if (data['content'] == 'gallery-manifest') {
					callback.call(data['manifest_type'], data);
				} else {
					callback.call(null, null);
				}
			});
		}
	}

	export module Utils {
		/**
		 * Concat pathname segments
		 * @param path Initial path
		 * @param .... Additional paths to join (optional)
		 * @return {string} All path levels merged and normalized with /
		 */
		export function pathJoin(path, ...otherPaths: string[]): string {
			var blankFilter = function(e) { return e != ""; }
			var levels = path.split('/').filter(blankFilter);
			if (otherPaths != null && otherPaths.length > 0) {
				for (var i = 1; i < arguments.length; i++) {
					levels.concat(otherPaths[i].split('/').filter(blankFilter));
				}
			}
			return levels.join('/');
		}
		
		/**
		 * Wrap number around upper and lower bounds
		 * @param value Value to wrap
		 * @param max Maxmium allowed value
		 * @param min Minimum allowed value (defaults to 0)
		 * @return Wrapped value
		 */
		export function wrap(value: number, max: number, min: number = 0): number {
			return (value > max) ? value - max : (value < min) ? value - min : value;
		}
	};
	
	
	/**
	* Gallery
	*/

	export class Gallery {
		private manifestUrl: string;
		private manifestData: Object = {};
		private settings: Object = { content: null, basePath: '', container: null };
		private tracking: Object = { position: 0, autoAdvance: false, speed: 1000 };
		private items: Array<Object>;
		private identifier: string;
		
		/**
		 * Gallery class constructor
		 * @param manifest JSON gallery manifest file url
		 * @param id Unique identifier for gallery
		 * @param containerSelector jquery selector for content container element
		 */
		constructor(manifest: string, id: string, containerSelector: string) {
			this.identifier = id;
			this.manifestUrl = manifest;
			var self = this;
			this.settings['container'] = $(containerSelector);
			Config.loadManifest(manifest, this.processManifest);
		}
		
		/**
		 * Process loaded manifest data
		 */
		private processManifest(type: string, data: Object): void {
			this.manifestData = data;
			this.items = new Array<Object>();
			this.settings['basePath'] = this.manifestData['root'];

			var tmpCType = null;
			switch (this.manifestData['content_type']) {
				case "image":
					tmpCType = MediaType.IMAGE;
					break;
				case "video":
					tmpCType = MediaType.VIDEO;
					break;
				case "audio":
					tmpCType = MediaType.AUDIO;
					break;
			}

			this.settings['content'] = tmpCType;

			for (var idx = 0; idx < this.manifestData['items'].length; idx++) {
				var tmp = {};
				var e = this.manifestData['items'][idx];
				tmp['src'] = Utils.pathJoin(this.settings['basePath'], e['src']);
				if (e.hasOwnProperty('meta')) {
					tmp['meta'] = e['meta'];
				} else {
					tmp['meta'] = {};
				}
				this.items.push(tmp);
			}
		}

		currentPosition(): number {
			return this.tracking['position'];
		}
		
		/**
		 * Change current track position by advancing or rewinding
		 * @param direction Direction and magnitude of change. Defaults to advance by 1 (1)
		 * @return True if value was wrapped, false otherwise
		 */
		track(direction: number = 1): boolean {
			this.tracking['position'] += direction;
			var adjusted = Utils.wrap(this.tracking['position'], this.items.length);
			var wrapped = (this.currentPosition() != adjusted);
			this.tracking['position'] = adjusted;
			this.update();
			return wrapped;
		}
		
		/**
		 * Update container element to contain currently tracked item
		 */
		update(): void {
			this.settings['container'].attr('src', this.items[this.currentPosition()]);
		}
	}

}