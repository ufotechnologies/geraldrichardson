/**
 * Gerald Richardson — 60 Years Behind The Camera.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

import 'whatwg-fetch';
import 'promise-polyfill/src/polyfill';
import 'mdn-polyfills/Object.assign';
import 'regenerator-runtime/runtime'; // Babel support for async/await

import { Events, Stage, Interface, Device, Interaction, Mouse, Utils,
    Assets, Video, AssetLoader, FontLoader, ScrollLock } from '../alien.js/src/Alien.js';

Config.UI_OFFSET = Device.phone ? 15 : 25;
Config.PHOTOS = [];
Config.ASSETS = [
    'assets/images/arrow.png',
    'assets/images/close.png',
    //'assets/images/logo_thestar.png',
    //'assets/images/logo_myseum.png',
    //'assets/images/logo_nfb.png',
    'assets/photos/1600/BIO_newspaperpresses.jpg'
];

Events.VIDEO = 'video';
Events.PHOTO = 'photo';
Events.TOGGLE_ABOUT = 'toggle_about';


class Photo {

    constructor(item) {
        this.id = item.id;
        this.path = `photos/${this.id}/`;
        this.title = item.title;
        this.pageTitle = `Gerald Richardson — ${this.title}`;
        this.date = item.date;
        this.location = item.location;
        this.type = item.type;
        this.image = item.image;
    }
}

/* class Data {

    static init() {
        //const self = this;

        this.dispatcher = Stage.initClass(StateDispatcher, true);

        addListeners();

        function addListeners() {
            //Stage.events.add(self.dispatcher, Events.UPDATE, stateChange);
        }

        //function stateChange(e) {
        //}
    }
} */

class UIClose extends Interface {

    constructor() {
        super('UIClose');
        const self = this;
        let clicked = false;

        initHTML();
        addListeners();

        function initHTML() {
            self.invisible();
            self.size(18);
            self.css({
                opacity: 0
            });
            self.transform({ y: -15 });
            self.bg('assets/images/close.png');
        }

        function addListeners() {
            self.interact(hover, click);
            self.hit.size('140%').center();
            self.hit.mouseEnabled(true);
            self.events.add(Events.KEYBOARD_UP, keyUp);
        }

        function hover(e) {
            if (clicked) return;
            if (e.action === 'over') self.tween({ opacity: 0.7 }, 100, 'easeOutSine');
            else self.tween({ opacity: 1 }, 300, 'easeOutSine');
        }

        function click(e) {
            clicked = true;
            self.events.fire(Events.CLICK, e);
        }

        function keyUp(e) {
            if (e.keyCode === 27) click(); // Esc
        }

        this.animateIn = () => {
            this.visible().tween({ y: 0, opacity: 1 }, 450, 'easeOutCubic');
        };
    }
}

class UIArrow extends Interface {

    constructor(left) {
        super('.UIArrow');
        const self = this;
        let arrow;

        initHTML();
        addListeners();

        function initHTML() {
            self.size(30).css({ opacity: typeof left !== 'undefined' ? 0 : 1 });
            arrow = self.create('.arrow');
            arrow.size(22).center().bg('assets/images/arrow.png');
            if (typeof left === 'boolean') arrow.transform({ rotation: left ? 90 : -90 });
        }

        function addListeners() {
            self.interact(null, click);
            self.hit.size(50).center();
        }

        function click() {
            self.events.fire(Events.CLICK, { direction: left ? -1 : 1 });
        }

        this.animateIn = () => {
            this.tween({ opacity: 1 }, 400, 'easeInOutSine');
        };

        this.animateOut = () => {
            this.tween({ opacity: 0 }, 400, 'easeInOutSine');
        };
    }
}

class UIAboutText extends Interface {

    constructor() {
        super('.UIAboutText');
        const self = this;
        const size = 17;
        let text;

        initHTML();
        initText();

        function initHTML() {
            self.css({ position: 'relative', opacity: 0 });
        }

        function initText() {
            text = self.create('.text');
            text.fontStyle('"Helvetica Neue", Helvetica, Arial, sans-serif', size, 'rgba(0, 0, 0, 0.9)');
            text.css({
                position: 'relative',
                maxWidth: 500,
                margin: '50px auto',
                lineHeight: '1.5'
            });
            if (Device.mobile) text.css({ margin: '50px 35px' });
            text.html('With a career spanning over 60 years, Gerald Richardson photographed many subjects and events, including the Royal Tour of 1939.  The British press voted one of his photographs the best of the Royal Tour. The images were printed in over 1400 newspapers making them viral images of their time.<br><br>While notable events and people like the Dionne Quintuplets, the Royal Tour of 1951, Farley Mowat, Gerda Munsinger and others appeared in his work, he also served time in the  Royal Canadian Navy, heading up the Photographic Unit.  By 1940, all three services – Army, Navy and Air Force – had photographers serving overseas  in these newly-formed photographic units. Three of the original photographers who were active in 1940 were our grandfather, Gerald Richardson of the Navy, Laurie Audrain of the Army, and Norman Drolet of the Air Force. After the war he photographed for the Toronto Star and later produced and directed films for the CBC.<br><br>Our grandfather left us the pages of the book “60 years Behind the Camera” that before his passing, he had hoped to publish. This website is a work in progress and the intention is to add more details below the photographs and upload a digitized version of his book. For now, we will continue to dig through hundreds of photographs and negatives that he left us and share when we have time to digitize and transcribe his words.');
        }

        this.animateIn = () => {
            this.tween({ opacity: 1 }, 3000, 'easeInOutSine');
        };
    }
}

class UIAbout extends Interface {

    constructor() {
        super('UIAbout');
        const self = this;
        let container, bg, wrapper, text, close;

        initHTML();
        initText();
        initClose();

        function initHTML() {
            self.size('100%').invisible().setZ(100000).mouseEnabled(true);
            self.css({
                position: 'fixed',
                overflow: 'hidden',
                overscrollBehavior: 'contain'
            });

            container = self.create('.container');
            container.size('100%');
            container.css({
                overflowX: 'hidden',
                overflowY: 'scroll'
            });
            container.bg('#fff');
            if (Device.mobile) container.css({ '-webkit-overflow-scrolling': 'touch' });

            bg = container.create('.bg');
            bg.size('100%', '50vh').mouseEnabled(false);
            bg.bg('assets/photos/1600/BIO_newspaperpresses.jpg', 'cover');

            wrapper = container.create('.wrapper');
            wrapper.css({ position: 'relative', paddingTop: '50vh' });
        }

        function initText() {
            text = wrapper.initClass(UIAboutText);
        }

        function initClose() {
            close = container.initClass(UIClose);
            self.events.add(close, Events.CLICK, () => {
                self.events.fire(Events.TOGGLE_ABOUT, { open: false });
            });

            close.css({
                top: 25,
                right: 25
            });
        }

        this.animateIn = () => {
            Global.ABOUT_VISIBLE = true;
            this.visible();
            bg.css({ opacity: 0 }).tween({ opacity: 1 }, 800, 'easeOutSine', 100);
            this.clearTween().transform({ scale: 1.3 }).tween({ scale: 1 }, 2000, 'easeOutQuart', 100);

            this.delayedCall(text.animateIn, 800);
            this.delayedCall(close.animateIn, 1800);
        };

        this.animateOut = callback => {
            Global.ABOUT_VISIBLE = false;
            this.tween({ opacity: 0 }, 700, 'easeOutSine', callback);
        };
    }
}

class UIPhotoCard extends Interface {

    constructor(data) {
        super('.UIPhotoCard');
        const self = this;
        let container, image;

        initHTML();
        initViews();

        function initHTML() {
            self.size('100%').invisible();
            container = self.create('.container');
            container.css({
                overflow: 'hidden',
                opacity: 0
            });
        }

        function initViews() {
            let path = `assets/photos/1600/${data.image}`;
            if (Utils.queryString('nocredit')) path = path.replace('_credit', '');

            Assets.loadImage(path).then(img => {
                image = img;
                self.resize();
                container.bg(path, 'cover');
                container.tween({ opacity: 1 }, 800, 'easeOutSine', 100);
            });
        }

        this.resize = () => {
            if (!image) return;
            let height = window.innerHeight - 10 * 2,
                width = Math.round(height * (image.width / image.height));
            if (width > window.innerWidth) {
                width = window.innerWidth;
                height = Math.round(width * (image.height / image.width));
            }
            container.size(width, height).center();
        };

        this.animateIn = direction => {
            const left = direction === -1;
            this.visible();
            if (direction) this.transform({ x: left ? -250 : 250 }).css({ opacity: 0 }).tween({ x: 0, opacity: 1 }, 900, 'easeOutCubic');
        };

        this.animateOut = direction => {
            const left = direction === -1;
            if (direction) this.tween({ x: left ? 250 : -250, opacity: 0 }, 500, 'easeOutCubic');
            this.delayedCall((() => this.destroy()), 1000);
        };
    }
}

class UIPhotoCarousel extends Interface {

    constructor(data, photos) {
        super('UIPhotoCarousel');
        const self = this;
        let current, prev, left, right,
            index = data.index;

        initHTML();
        initCarousel();
        initArrows();
        addListeners();

        function initHTML() {
            self.size('100%').mouseEnabled(true);
        }

        function initCarousel() {
            //self.initClass(Title, Util.formatDate(Utils.date(`${date.date}T18:00:00`)), 15, '#b3b9bf').css({ marginTop: 10, marginBottom: 0 });
            current = self.initClass(UIPhotoCard, data);
        }

        function initArrows() {
            left = self.initClass(UIArrow, true);
            right = self.initClass(UIArrow, false);
            if (Device.phone) {
                left.hide();
                right.hide();
            }
        }

        function addListeners() {
            self.events.add(left, Events.CLICK, change);
            self.events.add(right, Events.CLICK, change);
            self.touchSwipe(swipe);
        }

        function change(e) {
            const next = index + e.direction,
                data = photos[next];
            if (data) {
                prev = current;
                current = self.initClass(UIPhotoCard, data, self);
                if (next > 0) left.animateIn();
                if (next < photos.length) right.animateIn();
                if (next === 0) left.animateOut();
                if (next >= photos.length - 1) right.animateOut();
                index = next;
                prev.animateOut(e.direction);
                current.resize();
                current.animateIn(e.direction);
            }
        }

        function swipe(e) {
            if (e.direction === 'left') change({ direction: 1 });
            else if (e.direction === 'right') change({ direction: -1 });
        }

        this.resize = () => {
            current.resize();
            left.css({
                left: 10,
                top: '50%',
                marginTop: -15,
                zIndex: 200
            });
            right.css({
                right: 10,
                top: '50%',
                marginTop: -15,
                zIndex: 200
            });
        };

        this.animateIn = () => {
            current.animateIn();
            if (index > 0) left.animateIn();
            if (index < photos.length - 1) right.animateIn();
            if (index === 0) left.animateOut();
            if (index >= photos.length - 1) right.animateOut();
        };

        this.animateOut = () => {
            current.animateOut();
            if (index > 0) left.animateOut();
            right.animateOut();
        };

        this.moveTo = (slide, direction) => {
            const data = photos[slide];
            if (data && slide !== index) {
                prev = current;
                current = this.initClass(UIPhotoCard, data, this);
                if (slide > 0) left.animateIn();
                if (slide < photos.length) right.animateIn();
                if (slide === 0) left.animateOut();
                if (slide >= photos.length - 1) right.animateOut();
                index = slide;
                prev.animateOut(direction);
                current.resize();
                current.animateIn(direction);
            }
        };

        this.destroy = () => {
            current = current.destroy();
            return super.destroy();
        };
    }
}

class UIPhoto extends Interface {

    constructor(data, photos) {
        super('UIPhoto');
        const self = this;
        let media, carousel, close;

        function initHTML() {
            self.size('100%').hide().setZ(100000);
            self.css({
                position: 'fixed',
                top: 0,
                left: 0,
                backgroundColor: 'black',
                opacity: 0,
                overflow: 'hidden',
                overscrollBehavior: 'contain'
            });
            media = self.create('.fullscreen-carousel');
            media.size('100%');
        }

        function initClose() {
            close = self.initClass(UIClose);
            close.css({
                top: 25,
                right: 25
            });
        }

        function addListeners() {
            self.events.add(close, Events.CLICK, click);
            self.events.add(Events.RESIZE, resize);
            resize();
        }

        function click() {
            animateOut(() => {
                self.hide();
                self.events.fire(Events.PHOTO, { open: false });
            });
        }

        function initCarousel() {
            carousel = media.initClass(UIPhotoCarousel, data, photos);
            carousel.resize();
        }

        function animateIn() {
            carousel.animateIn();
            self.show().tween({ opacity: 1 }, 700, 'easeOutSine', () => close.animateIn());
        }

        function animateOut(callback) {
            self.tween({ opacity: 0 }, 550, 'easeOutSine', callback);
        }

        function resize() {
            if (carousel) carousel.resize();
        }

        this.close = callback => {
            if (callback) callback();
        };

        this.start = () => {
            initHTML();
            initClose();
            addListeners();
            this.events.fire(Events.PHOTO, { open: true });
            this.delayedCall(initCarousel, 100);
            this.delayedCall(animateIn, 100);
        };
    }
}

class UIRowCard extends Interface {

    constructor(data, photos) {
        super('.UIRowCard');
        const self = this;
        let container, image, player;

        initHTML();
        initViews();

        function initHTML() {
            self.invisible();
            self.css({
                position: 'relative',
                display: 'inline-block'
            });
            container = self.create('.container');
            container.size('100%');
            container.css({
                position: 'relative',
                overflow: 'hidden',
                opacity: 0
            });
            self.interact(hover, click);
        }

        function hover(e) {
            if (e.action === 'over') self.tween({ scale: 0.975 }, 300, 'easeOutQuart');
            else self.tween({ scale: 1 }, 300, 'easeOutQuart');
        }

        function click() {
            player = Stage.initClass(UIPhoto, data, photos);
            player.start();
            self.events.add(Events.PHOTO, closePhoto);
        }

        function closePhoto() {
            self.events.remove(Events.PHOTO, closePhoto);
            player.close(() => player.destroy());
        }

        function initViews() {
            let path = `assets/photos/400/${data.image}`;
            if (Utils.queryString('nocredit')) path = path.replace('_credit', '');

            Assets.loadImage(path).then(img => {
                image = img;
                self.resize();
                container.bg(path, 'cover');
                container.tween({ opacity: 1 }, 800, 'easeOutSine', 100);
            });
        }

        this.resize = () => {
            if (!image) return;
            let height = 240,
                width = Math.round(height * (image.width / image.height));
            if (width > window.innerWidth) {
                width = window.innerWidth;
                height = Math.round(width * (image.height / image.width));
            }
            this.size(width, height);
        };

        this.animateIn = direction => {
            const left = direction === -1;
            this.visible();
            if (direction) this.transform({ x: left ? -250 : 250 }).css({ opacity: 0 }).tween({ x: 0, opacity: 1 }, 900, 'easeOutCubic');
        };

        this.animateOut = direction => {
            const left = direction === -1;
            if (direction) this.tween({ x: left ? 250 : -250, opacity: 0 }, 500, 'easeOutCubic');
            this.delayedCall((() => this.destroy()), 1000);
        };
    }
}

class UIRow extends Interface {

    constructor(photos, tag) {
        super('.UIRow');
        const self = this;
        const cards = [];
        let top, container, title;

        initHTML();
        initRow();

        function initHTML() {
            self.size('100%', 310);
            self.css({ position: 'relative' });
            top = self.create('.top');
            top.size('100%', 70);
            top.css({ position: 'relative' });
            container = self.create('.container');
            container.size('100%', 240);
            container.css({
                position: 'relative',
                whiteSpace: 'nowrap',
                overflowX: 'scroll',
                overflowY: 'hidden'
            });
            if (Device.mobile) container.css({ '-webkit-overflow-scrolling': 'touch' });
        }

        function initRow() {
            AssetLoader.loadAssets(photos.map(item => `assets/photos/400/${item.image}`));
            title = top.initClass(UITitle, tag, true);
            title.css({
                padding: '0 30px',
                lineHeight: 70
            });
            photos.forEach((item, i) => {
                item.index = i;
                createCard(item);
            });
        }

        function createCard(item) {
            const card = container.initClass(UIRowCard, item, photos);
            card.animateIn();
            cards.push(card);
        }

        this.animateIn = () => {
            title.animateIn(1000);
        };

        this.animateOut = () => {
        };
    }
}

/* class UIButton extends Interface {

    constructor(copy = '') {
        super('.UIButton');
        const self = this;
        const size = 15;
        let text;

        initHTML();
        initText();

        function initHTML() {
            self.size('auto', size * 1.4).css({ opacity: 0 });
        }

        function initText() {
            text = self.create('.text');
            text.fontStyle('"Helvetica Neue", Helvetica, Arial, sans-serif', size, 'rgba(0, 0, 0, 0.9)');
            text.css({
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
            });
            text.html(copy);
        }

        this.update = e => {
            text.html(e);
        };

        this.animateIn = async delay => {
            await this.css({ opacity: 0 }).tween({ opacity: 1 }, 1000, 'easeOutCubic', delay);
        };

        this.animateOut = async delay => {
            await this.tween({ opacity: 0 }, 200, 'easeOutSine', delay);
        };
    }
} */

class UITitle extends Interface {

    constructor(copy = '', bold) {
        super('.UITitle');
        const self = this;
        const size = 15;
        let text;

        initHTML();
        initText();

        function initHTML() {
            self.css({ position: 'relative', opacity: 0 });
        }

        function initText() {
            text = self.create('.text');
            text.fontStyle('"Helvetica Neue", Helvetica, Arial, sans-serif', size, 'rgba(0, 0, 0, 0.9)');
            text.css({
                display: 'inline-block',
                position: 'relative',
                fontWeight: bold ? 'bold' : ''
            });
            text.html(copy);
        }

        this.update = e => {
            text.html(e);
        };

        this.animateIn = async delay => {
            await this.css({ opacity: 0 }).tween({ opacity: 1 }, 1000, 'easeOutCubic', delay);
        };

        this.animateOut = async delay => {
            await this.tween({ opacity: 0 }, 200, 'easeOutSine', delay);
        };
    }
}

class UICaption extends Interface {

    constructor(copy = '', bold) {
        super('.UICaption');
        const self = this;
        const size = 17;
        let text;

        initHTML();
        initText();

        function initHTML() {
            self.css({ position: 'relative', opacity: 0 });
        }

        function initText() {
            text = self.create('.text');
            text.fontStyle('Playfair Display', size, 'rgba(0, 0, 0, 0.9)');
            text.css({
                position: 'relative',
                fontWeight: bold ? 'bold' : '',
                lineHeight: '1.5'
            });
            text.html(copy);
        }

        this.update = e => {
            text.html(e);
        };

        this.animateIn = async delay => {
            await this.transform({ y: size }).css({ opacity: 0 }).tween({ y: 0, opacity: 1 }, 1000, 'easeOutCubic', delay);
        };

        this.animateOut = async delay => {
            await this.tween({ opacity: 0 }, 200, 'easeOutSine', delay);
        };
    }
}

/* class UILoader extends Interface {

    constructor() {
        super('.UILoader');
        const self = this;
        const size = 15;
        let number, button;

        this.progress = 0;

        initHTML();
        initViews();

        function initHTML() {
            self.size('auto', size * 1.4);
        }

        function initViews() {
            number = self.initClass(UIButton);
            button = self.initClass(UIButton, 'Enter');
        }

        this.update = e => {
            tween(this, { progress: e.percent }, 2500, 'easeInOutSine', null, () => {
                if (!number.element) return;
                number.update(Math.round(this.progress * 100));
                if (this.progress >= 1) this.start();
            });
        };

        this.start = () => {
            number.tween({ opacity: 0 }, 200, 'easeOutSine', () => {
                number.hide();
                button.css({ opacity: 0 }).tween({ opacity: 1 }, 1000, 'easeOutQuart');
            });
        };

        this.animateIn = async delay => {
            this.animatedIn = true;
            this.delayedCall(async () => {
                if (this.progress >= 1) return;
                await number.css({ opacity: 0 }).tween({ opacity: 1 }, 1000, 'easeOutCubic');
            }, 2000);
            await this.css({ opacity: 0 }).tween({ opacity: 1 }, 1000, 'easeOutCubic', delay);
        };

        this.animateOut = async delay => {
            this.animatedIn = false;
            await this.tween({ opacity: 0 }, 200, 'easeOutSine', delay);
        };
    }
} */

class UICaptionCard extends Interface {

    constructor(views) {
        super('.UICaptionCard');
        const self = this;

        initHTML();
        initViews();

        function initHTML() {
            self.size(300, 'auto').css({ left: Config.UI_OFFSET, bottom: Config.UI_OFFSET });
            self.bg('#fff');

            self.inner = self.create('.inner');
            self.inner.css({ position: 'relative', margin: '10px 10px 40px 20px' });
        }

        function initViews() {
            self.inner.add(views[0]);
            self.add(views[1]);
            views[1].css({ left: 20, bottom: 12 });
        }

        this.animateIn = async () => {
            await views[0].animateIn();
            await views[1].animateIn(2000);
        };

        this.animateOut = () => {
            views[1].animateOut();
            views[0].animateOut();
        };
    }
}

class UINavLink extends Interface {

    constructor(config) {
        super('.UINavLink');
        const self = this;
        const size = 15;
        // let text, over, line;
        let text, line;

        initHTML();
        initText();
        addListeners();

        function initHTML() {
            self.size(config.width, 25).css({ bottom: 0, overflow: 'hidden' });

            line = self.create('.line');
            line.size(config.width, 2).css({ bottom: 3, left: '-100%' }).bg('rgba(0, 0, 0, 0.9)');
        }

        function initText() {
            text = self.create('.text');
            text.fontStyle('"Helvetica Neue", Helvetica, Arial, sans-serif', size, 'rgba(0, 0, 0, 0.9)');
            text.css({
                fontWeight: 'bold',
                lineHeight: '1.2',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap'
            });
            text.html(config.text);

            // over = text.clone();
            // self.add(over);
            // over.transform({ y: 15 }).css({ opacity: 0 });
        }

        function addListeners() {
            self.interact(hover, click);
            self.hit.mouseEnabled(true);
        }

        function hover(e) {
            if (self.locked) return;
            self.events.fire(Events.HOVER, e);
            if (e.action === 'over') {
                // text.tween({ y: -15, opacity: 0 }, 300, 'easeOutCubic');
                // over.tween({ y: 0, opacity: 1 }, 500, 'easeOutCubic');
                line.clearTween().transform({ x: 0 }).tween({ x: config.width }, 300, 'easeOutCubic');
            } else {
                // text.tween({ y: 0, opacity: 0.75 }, 300, 'easeOutCubic');
                // over.tween({ y: 15, opacity: 0 }, 500, 'easeOutCubic');
                line.tween({ x: config.width * 2 }, 300, 'easeOutCubic');
            }
        }

        function click() {
            self.events.fire(Events.CLICK, config);
        }

        this.lock = () => {
            this.locked = true;
        };

        this.unlock = () => {
            this.locked = false;
            // text.tween({ y: 0, opacity: 0.75 }, 300, 'easeOutCubic');
            // over.tween({ y: 15, opacity: 0 }, 500, 'easeOutCubic');
            line.tween({ x: config.width * 2 }, 300, 'easeOutCubic');
        };

        this.animateIn = async delay => {
            this.animatedIn = true;
            await this.css({ opacity: 0 }).tween({ opacity: 1 }, 1000, 'easeOutCubic', delay);
        };

        this.animateOut = async delay => {
            this.animatedIn = false;
            await this.tween({ opacity: 0 }, 200, 'easeOutSine', delay);
        };
    }
}

class UINav extends Interface {

    constructor() {
        super('UINav');
        const self = this;
        let button;

        initHTML();
        initLinks();
        addListeners();

        function initHTML() {
            self.size('100%', 70).setZ(20).hide();
        }

        function initLinks() {
            button = self.initClass(UINavLink, { text: 'About', width: 45 });
            button.css({
                top: 25,
                right: 30
            });
        }

        function addListeners() {
            self.events.add(button, Events.CLICK, () => {
                if (!Global.ABOUT_VISIBLE) {
                    self.events.fire(Events.TOGGLE_ABOUT, { open: true });
                } else {
                    self.events.fire(Events.TOGGLE_ABOUT, { open: false });
                }
            });
        }

        this.animateIn = () => {
            this.show().css({ opacity: 0 }).tween({ opacity: 1 }, 1000, 'easeInOutSine');
        };

        this.animateOut = () => {
            this.tween({ opacity: 0 }, 700, 'easeOutSine', () => this.hide());
        };
    }
}

class UI extends Interface {

    constructor() {
        super('UI');
        const self = this;
        let nav, about;

        initContainer();
        initView();
        addListeners();
        animateIn();

        function initContainer() {
            self.size('100%').mouseEnabled(false).invisible();
            self.css({
                top: 0,
                left: 0
            });
        }

        function initView() {
            nav = self.initClass(UINav);
        }

        function animateIn() {
            self.visible();
            nav.animateIn();
        }

        function addListeners() {
            // self.events.add(Events.PHOTO, photo);
            self.events.add(Events.TOGGLE_ABOUT, toggleAbout);
        }

        /* function photo(e) {
            if (e.open) {
                nav.animateOut();
            } else {
                nav.animateIn();
            }
        } */

        function toggleAbout(e) {
            if (e.open) {
                if (about) about.destroy();
                about = self.initClass(UIAbout);
                defer(about.animateIn);
            } else {
                about.animateOut(() => {
                    about = about.destroy();
                });
            }
        }
    }
}

class IntroLoader extends Interface {

    constructor() {
        super('IntroLoader');
        const self = this;
        let wrapper, lines;

        initHTML();
        initViews();

        function initHTML() {
            self.size('100%').bg('#fff');
            self.css({
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                cursor: 'pointer'
            });

            wrapper = self.create('.wrapper');
            wrapper.css({ padding: '0 20px' });
            if (Device.phone) wrapper.css({ maxWidth: 335 });
        }

        function initViews() {
            lines = [];

            const text = [
                'GERALD RICHARDSON',
                '60 Years Behind The Camera'
            ];
            text.forEach((copy, i) => {
                const line = wrapper.initClass(UITitle, copy, i === 0);
                line.css({ textAlign: 'center', opacity: 0 });
                if (i === 1) line.css({ marginTop: 10 });
                lines.push(line);
            });

            const button = wrapper.initClass(UINavLink, { text: 'Enter', width: 40 });
            button.css({
                position: 'relative',
                margin: '20px auto 0',
                textAlign: 'center',
                opacity: 0
            });
            lines.push(button);

            wrapper.size().center().css({ marginTop: -108 });
        }

        this.animateIn = async () => {
            this.animatedIn = true;
            await this.wait(100);
            let delay = 0;
            lines.forEach(line => {
                line.promise = line.animateIn(delay);
                delay += 500;
            });
            await lines.last().promise;
        };

        this.animateOut = async callback => {
            this.animatedIn = false;
            lines.reverse();
            let delay = 0;
            lines.forEach(line => {
                line.promise = line.animateOut(delay);
                delay += 250;
            });
            await lines.last().promise;
            return this.tween({ opacity: 0 }, 1350, 'easeInSine', callback);
        };
    }
}

class Loader extends Interface {

    constructor() {
        super('Loader');
        const self = this;
        // let bg, image, caption, title, view;
        // let caption, title, view;
        let intro;

        initHTML();
        initViews();
        initLoader();
        // addListeners();
        defer(animateIn);

        function initHTML() {
            // self.size('100%').enable3D(2000).invisible();
            self.size('100%').invisible();
            self.css({
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                cursor: 'pointer'
            });

            // bg = self.create('.bg');
            // bg.css({ top: 70, opacity: 0 }).transform({ z: -300, rotationX: -1, rotationY: 1, rotationZ: -0.5 }).enable3D().mouseEnabled(false);
        }

        function initViews() {
            // title = self.initClass(UICaption, '“I’ve seen [Farley Mowat] swim naked among the thousands of Caplin...” &nbsp;—&nbsp;Gerald&nbsp;Richardson');
            // view = self.initClass(UILoader);
            // caption = self.initClass(UICaptionCard, [title, view]);
            intro = self.initClass(IntroLoader);
        }

        function initLoader() {
            Promise.all([
                FontLoader.loadFonts(['Helvetica Neue', 'Playfair Display']),
                AssetLoader.loadAssets([`assets/data/data.json?${Utils.timestamp()}`])
            ]).then(() => {
                const photos = Assets.getData('data').photos;
                photos.forEach(item => Config.PHOTOS.push(new Photo(item)));

                /* Data.init();

                const featured = [];
                photos.forEach(item => {
                    if (~item.type.toLowerCase().indexOf('Featured'.toLowerCase())) featured.push(item);
                });
                let path = `assets/photos/800/${featured.random().image}`;
                if (Utils.queryString('nocredit')) path = path.replace('_credit', '');

                const loader = self.initClass(AssetLoader, Config.ASSETS);
                Assets.loadImage(path).then(img => {
                    image = img;
                    resize();
                    bg.bg(path, 'cover');
                    bg.tween({ opacity: 1 }, 800, 'easeOutSine', 100);
                    bg.tween({ z: 0, rotationZ: 0 }, 7000, 'easeOutCubic');
                    bg.tween({ rotationX: 0, rotationY: 0 }, 2500, 'easeInOutSine');
                    loader.trigger(1);
                });
                loader.add(1);
                self.events.add(loader, Events.PROGRESS, view.update);
                self.events.add(loader, Events.COMPLETE, () => {
                    self.events.add(Mouse.input, Interaction.CLICK, click);
                }); */

                // Preload first couple rows
                const matched = [];
                ['1939 Royal Visit', '1950s Royals'].forEach(tag => {
                    Config.PHOTOS.forEach(item => {
                        if (~item.type.toLowerCase().indexOf(tag.toLowerCase())) matched.push(item);
                    });
                });

                const assets = Config.ASSETS.concat(matched.map(item => `assets/photos/400/${item.image}`));
                AssetLoader.loadAssets(assets);

                self.events.add(Mouse.input, Interaction.CLICK, click);
            });
        }

        function click() {
            self.events.remove(Mouse.input, Interaction.CLICK, click);
            Container.instance().start();
        }

        /* function addListeners() {
            self.events.add(Events.RESIZE, resize);
        }

        function resize() {
            if (!image) return;
            let height = window.innerHeight - 120 * 2,
                width = Math.round(height * (image.width / image.height));
            if (width > window.innerWidth) {
                width = window.innerWidth;
                height = Math.round(width * (image.height / image.width));
            }
            bg.size(width, height).center(1, 0);
        } */

        async function animateIn() {
            self.visible();
            // await caption.animateIn();
            await intro.animateIn();
        }

        this.animateOut = callback => {
            // caption.animateOut();
            intro.animateOut();
            // bg.tween({ z: -300 }, 700, 'easeInCubic');
            this.tween({ opacity: 0 }, 1350, 'easeOutSine', callback);
        };
    }
}

/*class IntroLogo extends Interface {

    constructor(config) {
        super('.IntroLogo');
        const self = this;
        let logo;

        initHTML();
        initLogo();

        function initHTML() {
            self.css({
                position: 'relative',
                textAlign: 'center',
                opacity: 0
            });
        }

        function initLogo() {
            logo = self.create('.logo');
            logo.size(config.width, config.height);
            logo.css({
                position: 'relative',
                display: 'inline-block'
            });
            logo.bg(config.image, 'contain');
        }

        this.animateIn = async delay => {
            await this.transform({ y: 20 }).css({ opacity: 0 }).tween({ y: 0, opacity: 1 }, 1000, 'easeOutCubic', delay);
        };

        this.animateOut = async delay => {
            await this.tween({ opacity: 0 }, 500, 'easeOutSine', delay);
        };
    }
}*/

class Intro2 extends Interface {

    constructor() {
        super('Intro2');
        const self = this;
        let wrapper, lines;

        initHTML();
        initViews();

        function initHTML() {
            self.size('100%').bg('#fff');
            self.css({
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                cursor: 'pointer'
            });

            wrapper = self.create('.wrapper');
            wrapper.css({ padding: '0 20px' });
            if (Device.phone) wrapper.css({ maxWidth: 335 });
        }

        function initViews() {
            lines = [];

            //const title = wrapper.initClass(UITitle, 'in association with');
            //title.css({ textAlign: 'center' });
            //lines.push(title);
            const text = [
                'This site is dedicated to our grandfather, Gerald Richardson,',
                'a true influence on each of our paths.'
            ];
            text.forEach((copy, i) => {
                const line = wrapper.initClass(UITitle, copy, i === 0);
                line.css({ textAlign: 'center', opacity: 0 });
                if (i === 1) line.css({ marginTop: 10 });
                lines.push(line);
            });

            /*const logos = [
                { image: 'assets/images/logo_thestar.png', width: 187, height: 21 },
                { image: 'assets/images/logo_myseum.png', width: 124, height: 124 },
                { image: 'assets/images/logo_nfb.png', width: 74, height: 36 }
            ];
            logos.forEach((logo, i) => {
                const line = wrapper.initClass(IntroLogo, logo);
                if (i === 0) line.css({ marginTop: 20 });
                lines.push(line);
            });*/

            wrapper.size().center().css({ marginTop: -108 });
        }

        this.animateIn = async () => {
            this.animatedIn = true;
            await this.wait(100);
            let delay = 0;
            lines.forEach(line => {
                line.promise = line.animateIn(delay);
                delay += 500;
            });
            await lines.last().promise;
        };

        this.animateOut = async callback => {
            this.animatedIn = false;
            lines.reverse();
            let delay = 0;
            lines.forEach(line => {
                line.promise = line.animateOut(delay);
                delay += 250;
            });
            await lines.last().promise;
            return this.tween({ opacity: 0 }, 700, 'easeInSine', callback);
        };
    }
}

class Intro1 extends Interface {

    constructor() {
        super('Intro1');
        const self = this;
        let wrapper, lines;

        initHTML();
        initViews();

        function initHTML() {
            self.size('100%').bg('#fff');
            self.css({
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                cursor: 'pointer'
            });

            wrapper = self.create('.wrapper');
        }

        function initViews() {
            lines = [];

            const text = [
                'A gift for James Richardson'
            ];
            text.forEach((copy, i) => {
                const line = wrapper.initClass(UITitle, copy, i === 0);
                line.css({ textAlign: 'center', opacity: 0 });
                if (i === 1) line.css({ marginTop: 10 });
                lines.push(line);
            });

            wrapper.size().center().css({ marginTop: -108 });
        }

        this.animateIn = async () => {
            this.animatedIn = true;
            await this.wait(100);
            let delay = 0;
            lines.forEach(line => {
                line.promise = line.animateIn(delay);
                delay += 500;
            });
            await lines.last().promise;
        };

        this.animateOut = async callback => {
            this.animatedIn = false;
            lines.reverse();
            let delay = 0;
            lines.forEach(line => {
                line.promise = line.animateOut(delay);
                delay += 250;
            });
            await lines.last().promise;
            return this.tween({ opacity: 0 }, 700, 'easeInSine', callback);
        };
    }
}

class PierreBertonVideo extends Interface {

    constructor() {
        super('PierreBertonVideo');
        const self = this;
        let media, player, caption, title, button;

        initHTML();
        initViews();
        initVideo();

        function initHTML() {
            self.size('100%').enable3D(2000);
            self.css({
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                cursor: 'pointer'
            });

            media = self.create('fullscreen-video');
            media.css({ top: 70 }).bg('#fff').enable3D().mouseEnabled(false);
        }

        function initViews() {
            title = self.initClass(UICaption, '“Great Days On King” &nbsp;—&nbsp;Pierre&nbsp;Berton');
            // button = self.initClass(UIButton, 'Skip');
            button = self.initClass(UINavLink, { text: 'Skip', width: 32 });
            caption = self.initClass(UICaptionCard, [title, button]);

            button.css({
                bottom: 7,
                opacity: 0
            });
        }

        function addListeners() {
            self.events.add(Events.RESIZE, resize);
            self.events.add(Mouse.input, Interaction.CLICK, ended);
            resize();
        }

        function resize() {
            let height = window.innerHeight - 120 * 2,
                width = Math.round(height * (500 / 400));
            if (width > window.innerWidth) {
                width = window.innerWidth;
                height = Math.round(width * (400 / 500));
            }
            media.size(width, height).center(1, 0);
        }

        function ended() {
            animateOut(() => {
                self.hide();
                self.events.fire(Events.VIDEO, { open: false });
            });
        }

        function initVideo() {
            player = media.initClass(Video, {
                src: 'assets/videos/Pierre_Berton_Great_Days_On_King.mp4',
                width: 720,
                height: 480,
                events: ['timeupdate', 'ended']
            });
            player.object.size('100%');
            self.events.add(player, Video.ENDED, ended);
            player.unmute();
        }

        async function animateIn() {
            await caption.animateIn();
        }

        function animateOut(callback) {
            caption.animateOut();
            media.tween({ z: -300 }, 700, 'easeInCubic');
            self.tween({ opacity: 0 }, 700, 'easeOutSine', callback);
        }

        this.close = callback => {
            if (player && player.stop) player.stop();
            if (callback) callback();
        };

        this.start = () => {
            player.element.load();
            const promise = player.play();
            if (promise) {
                promise.catch(() => {
                    //player.mute();
                    //player.play();
                });
            }
            addListeners();
            this.events.fire(Events.VIDEO, { open: true });
            this.delayedCall(animateIn, 500);
        };
    }
}

class Container extends Interface {

    static instance() {
        if (!this.singleton) this.singleton = new Container();
        return this.singleton;
    }

    constructor() {
        super('Container');
        const self = this;
        const rows = [];
        let player, intro1, intro2, loader, top, lines, bottom;

        initContainer();
        initViews();
        addListeners();

        function initContainer() {
            Stage.allowScroll();
            Stage.css({ position: 'static' });
            self.css({ position: 'static' });
            Stage.add(self);
            window.history.scrollRestoration = 'manual';

            top = self.create('.top');
            top.size('100%', 'auto');
            top.css({
                position: 'relative',
                paddingTop: 70,
                paddingBottom: 30
            });
        }

        function initViews() {
            player = self.initClass(PierreBertonVideo);
            intro2 = self.initClass(Intro2);
            intro1 = self.initClass(Intro1);
            loader = self.initClass(Loader);
        }

        function addListeners() {
            self.events.add(Events.PHOTO, disable);
            self.events.add(Events.TOGGLE_ABOUT, disable);
        }

        function disable(e) {
            if (e.open) {
                self.mouseEnabled(false);
                ScrollLock.instance().lock();
            } else {
                self.mouseEnabled(true);
                ScrollLock.instance().unlock();
            }
        }

        async function closeVideo() {
            self.events.remove(Events.VIDEO, closeVideo);
            if (player && player.close) player.close(() => player = player.destroy());

            initPhotos();

            if (intro1 && intro1.animatedIn) await intro1.animateOut();
            if (intro1 && intro1.destroy) intro1 = intro1.destroy();

            if (intro2 && intro2.animatedIn) await intro2.animateOut();
            if (intro2 && intro2.destroy) intro2 = intro2.destroy();
        }

        async function initPhotos() {
            lines = [];

            const text = [
                'GERALD RICHARDSON',
                '60 Years Behind The Camera'
            ];
            text.forEach((copy, i) => {
                const line = top.initClass(UITitle, copy, i === 0);
                line.css({ textAlign: 'center', opacity: 0 });
                if (i === 1) line.css({ marginTop: 10 });
                lines.push(line);
            });

            ['1939 Royal Visit', '1950s Royals', 'Navy', 'Fashion', 'Portraits of Gerry Richardson', 'Film and Television', 'News'].forEach(tag => {
                const matched = [];
                Config.PHOTOS.forEach(item => {
                    if (~item.type.toLowerCase().indexOf(tag.toLowerCase())) matched.push(item);
                });
                createRow(matched, tag);
            });

            bottom = self.create('.bottom');
            bottom.size('100%', 'auto');
            bottom.css({
                position: 'relative',
                paddingTop: 70,
                paddingBottom: 30
            });

            const copyright = bottom.initClass(UITitle, 'All rights reserved.');
            copyright.css({
                padding: '0 30px'
            });
            copyright.animateIn(1000);

            const button = bottom.initClass(UINavLink, { text: 'Contact', width: 59 });
            button.css({
                bottom: 25,
                right: 30
            });
            self.events.add(button, Events.CLICK, () => {
                open('mailto:info@geraldrichardson.ca');
            });

            await self.wait(2000);
            let delay = 0;
            lines.forEach(line => {
                line.promise = line.animateIn(delay);
                delay += 500;
            });
            await lines.last().promise;

            Stage.initClass(UI);
        }

        function createRow(photos, tag) {
            const row = self.initClass(UIRow, photos, tag);
            row.animateIn();
            rows.push(row);
        }

        this.start = () => {
            player.start();
            self.events.add(Events.VIDEO, closeVideo);

            loader.animateOut(async () => {
                loader = loader.destroy();

                await intro1.animateIn();
                await this.wait(2000);
                if (!intro1) return;
                await intro1.animateOut();
                intro1 = intro1.destroy();

                if (!player) {
                    await intro2.animateOut();
                    intro2 = intro2.destroy();
                    return;
                }
                await intro2.animateIn();
                await this.wait(5000);
                if (!intro2) return;
                await intro2.animateOut();
                intro2 = intro2.destroy();
            });
        };
    }
}

class Main {

    constructor() {
        Mouse.init();
        init();

        function init() {
            Container.instance();
        }
    }
}

new Main();
