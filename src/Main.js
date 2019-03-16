/**
 * Gerald Richardson — 60 years behind the camera.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

import 'whatwg-fetch';
import 'promise-polyfill/src/polyfill';
import 'mdn-polyfills/Object.assign';
import 'regenerator-runtime/runtime'; // Babel support for async/await

import { Events, Stage, Interface, Device, Interaction, Mouse, Accelerometer, Utils,
    Assets, Video, AssetLoader, FontLoader, StateDispatcher, ScrollLock, Vector2 } from '../alien.js/src/Alien.js';

Config.UI_OFFSET = Device.phone ? 15 : 25;
Config.PHOTOS = [];
Config.ASSETS = [
    'assets/images/arrow.png',
    'assets/images/close.png',
    //'assets/images/logo_thestar.png',
    //'assets/images/logo_myseum.png',
    //'assets/images/logo_nfb.png'
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

class Data {

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
}

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
        let text;

        initHTML();
        initText();

        function initHTML() {
            self.size(420, 200).center(1, 0).css({ top: 150 }).invisible();
        }

        function initText() {
            text = self.create('.text');
            text.fontStyle('CircularLight', 13, '#fff');
            text.css({ lineHeight: 21, textAlign: 'center' });
            text.html('Eye of the Stormers is a collaborative project between Bastille and Spotify, as a companion piece to their new album, Wild World. The more times a city streams Bastille’s music on Spotify, the bigger the storm they create.<br/><br/>Start streaming now to leave your mark on the Wild World.<br/>You never know what a storm might bring...');
        }

        this.animateIn = () => {
            this.visible().css({ opacity: 0 }).tween({ opacity: 1 }, 3000, 'easeInOutSine');
        };
    }
}

class UIAbout extends Interface {

    constructor() {
        super('UIAbout');
        const self = this;
        const mouse = new Vector2();
        let bg, wrapper, text, close, marginTop, scale;

        initHTML();
        initText();
        initClose();
        addListeners();

        function initHTML() {
            self.size('100%').invisible().setZ(9).mouseEnabled(true);
            self.css({ overflow: 'hidden' });

            bg = self.create('.bg');
            bg.size('100%').css({ opacity: 0.8 }).setZ(0).mouseEnabled(false);

            wrapper = self.create('.wrapper');
            wrapper.val = 1;
            wrapper.size(500, 480).center().setZ(2);
            marginTop = 480 / 2;

            wrapper.inner = wrapper.create('.inner');
            wrapper.inner.size('100%').transform({ z: 10 });
        }

        function initText() {
            text = wrapper.inner.initClass(UIAboutText);
        }

        function initClose() {
            close = self.initClass(UIClose);
            self.events.add(close, Events.CLICK, () => {
                self.events.fire(Events.TOGGLE_ABOUT, { open: false });
            });

            close.css({
                top: 25,
                right: 25
            });
        }

        function loop() {
            let x, y;
            if (Device.mobile) {
                mouse.lerp(Accelerometer, 0.1);
                x = Math.range(mouse.x, -5, 5, 0, Stage.width, true);
                y = Math.range(mouse.y, -10, 10, 0, Stage.height, true);
            } else {
                mouse.lerp(Mouse, 0.05);
                x = mouse.x;
                y = mouse.y;
            }

            wrapper.x = Math.range(x, 0, Stage.width, 25, -25) * wrapper.val;
            wrapper.scale = scale;
            wrapper.z = 50;
            wrapper.rotationY = Math.range(x, 0, Stage.width, -10, 10) * wrapper.val * 0.8;
            wrapper.rotationX = Math.range(y, 0, Stage.height, 5, -5) * wrapper.val * 0.8;
            wrapper.transform();

            bg.scale = 1.1;
            bg.x = -Math.range(x, 0, Stage.width, 25, -25) * wrapper.val;
            bg.rotationY = -Math.range(x, 0, Stage.width, -10, 10) * wrapper.val * 0.5;
            bg.rotationX = -Math.range(y, 0, Stage.height, 5, -5) * wrapper.val * 0.5;
            bg.transform();
        }

        function addListeners() {
            self.events.add(Events.RESIZE, resize);
            resize();
        }

        function resize() {
            const scaleX = Math.range(Stage.width, 0, 520, 0, 1, true),
                scaleY = Math.range(Stage.height, 0, 700, 0, 1, true);
            scale = Math.min(scaleX, scaleY);
            const scaleOffset = 1 - scale,
                marginTopOffset = (marginTop * scaleOffset) / 2;

            wrapper.transform({ scale }).transformPoint('50%', '80%').css({ marginTop: -(marginTop + marginTopOffset) });

            bg.bg('assets/photos/1600/Grandpa_1.jpg', 'cover');
        }

        this.animateIn = () => {
            Global.ABOUT_VISIBLE = true;
            resize();
            this.enable3D(2000);
            wrapper.enable3D();
            wrapper.inner.enable3D();
            this.startRender(loop);

            this.visible();
            tween(wrapper, { val: 1 }, 500, 'easeInOutSine');
            bg.css({ opacity: 0 }).tween({ opacity: 1 }, 800, 'easeOutSine', 100);
            this.clearTween().transform({ scale: 1.3 }).tween({ scale: 1 }, 2000, 'easeOutQuart', 100);

            this.delayedCall(text.animateIn, 800);
            this.delayedCall(close.animateIn, 1800);
        };

        this.animateOut = callback => {
            Global.ABOUT_VISIBLE = false;
            tween(wrapper, { val: 1 }, 500, 'easeInOutSine');
            this.tween({ opacity: 0 }, 700, 'easeOutSine');
            wrapper.inner.tween({ scale: 0.95 }, 700, 'easeOutSine');

            this.delayedCall(() => {
                callback();
                this.stopRender(loop);
            }, 700);
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
            //self.initClass(Title, Util.formatDate(Utils.date(`${date.date}T18:00:00`)), 12, '#b3b9bf').css({ marginTop: 10, marginBottom: 0 });
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
            self.size('100%').hide();
            self.css({
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                backgroundColor: 'black',
                opacity: 0
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
            title = top.initClass(UITitle, tag);
            title.size();
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

        this.scroll = x => {
            container.size();
            title.css({ x: x + title.width > container.width ? container.width - title.width : x });
        };

        this.animateIn = () => {
            title.animateIn(1000);
        };

        this.animateOut = () => {
        };
    }
}

class UIButton extends Interface {

    constructor(copy = '') {
        super('.UIButton');
        const self = this;
        const size = 11;
        let text;

        initHTML();
        initText();

        function initHTML() {
            self.size('auto', size * 1.4).css({ opacity: 0 });
        }

        function initText() {
            text = self.create('.text');
            text.fontStyle('Source Sans Pro', size, '#000');
            text.css({
                fontWeight: '600',
                lineHeight: size * 1.5,
                letterSpacing: 1,
                textTransform: 'uppercase',
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
}

class UITitle extends Interface {

    constructor(copy = '') {
        super('.UITitle');
        const self = this;
        const size = 11;
        let text;

        initHTML();
        initText();

        function initHTML() {
            self.css({ position: 'relative', opacity: 0 });
        }

        function initText() {
            text = self.create('.text');
            text.fontStyle('Source Sans Pro', size, '#000');
            text.css({
                position: 'relative',
                display: 'inline-block',
                padding: '0 30px',
                fontWeight: '600',
                lineHeight: 70,
                letterSpacing: 1,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
            });
            text.html(copy);
            text.size();
            self.size(text.width, text.height);
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
        const size = 16;
        let text;

        initHTML();
        initText();

        function initHTML() {
            self.css({ position: 'relative', opacity: 0 });
        }

        function initText() {
            text = self.create('.text');
            //text.fontStyle('Source Sans Pro', size, '#000', 'italic');
            text.fontStyle('Crimson Text', size, '#000');
            //text.fontStyle('Minion Pro', size, '#000');
            text.css({
                position: 'relative',
                fontWeight: bold ? '600' : '400',
                lineHeight: size * 1.4,
                letterSpacing: size * 0.035
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
            await this.tween({ opacity: 0 }, 500, 'easeOutSine', delay);
        };
    }
}

class UILoader extends Interface {

    constructor() {
        super('.UILoader');
        const self = this;
        const size = 11;
        let number, button;

        this.progress = 0;

        initHTML();
        initViews();

        function initHTML() {
            self.size('auto', size * 1.4);
        }

        function initViews() {
            number = self.initClass(UIButton);
            button = self.initClass(UIButton, (Device.mobile ? 'Tap' : 'Click') + ' to enter');
        }

        this.update = e => {
            tween(this, { progress: e.percent }, 2500, 'easeInOutSine', null, () => {
                if (!number.element) return;
                number.update(Math.round(this.progress * 100));
                if (this.progress >= 1) this.events.fire(Events.COMPLETE);
            });
        };

        this.start = () => {
            if (!this.animatedIn) return;
            number.tween({ opacity: 0 }, 200, 'easeOutSine', () => {
                number.hide();
                this.delayedCall(() => {
                    if (!this.animatedIn) return;
                    button.css({ opacity: 0 }).tween({ opacity: 1 }, 1000, 'easeOutQuart');
                }, 100);
            });
        };

        this.animateIn = async () => {
            this.animatedIn = true;
            await number.css({ opacity: 0 }).tween({ opacity: 1 }, 1000, 'easeOutCubic', 2000);
        };

        this.animateOut = async delay => {
            this.animatedIn = false;
            await this.tween({ opacity: 0 }, 200, 'easeOutSine', delay);
        };
    }
}

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
        const size = 11;
        let text, over, line;

        initHTML();
        initText();
        addListeners();

        function initHTML() {
            self.size(config.width, 25).css({ bottom: 0, overflow: 'hidden' });

            line = self.create('.line');
            line.size(config.width, 2).css({ bottom: 3, left: '-100%' }).bg('#000');
        }

        function initText() {
            text = self.create('.text');
            text.fontStyle('Source Sans Pro', size, '#000');
            text.css({
                width: '100%',
                fontWeight: '600',
                letterSpacing: 1,
                textAlign: 'center',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                opacity: 0.75
            });
            text.html(config.text);

            over = text.clone();
            self.add(over);
            over.transform({ y: 15 }).css({ opacity: 0 });
        }

        function addListeners() {
            self.interact(hover, click);
            self.hit.mouseEnabled(true);
        }

        function hover(e) {
            if (self.locked) return;
            self.events.fire(Events.HOVER, e);
            if (e.action === 'over') {
                text.tween({ y: -12, opacity: 0 }, 300, 'easeOutCubic');
                over.tween({ y: 0, opacity: 1 }, 500, 'easeOutCubic');
                line.clearTween().transform({ x: 0 }).tween({ x: config.width }, 300, 'easeOutCubic');
            } else {
                text.tween({ y: 0, opacity: 0.75 }, 300, 'easeOutCubic');
                over.tween({ y: 15, opacity: 0 }, 500, 'easeOutCubic');
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
            text.tween({ y: 0, opacity: 0.75 }, 300, 'easeOutCubic');
            over.tween({ y: 15, opacity: 0 }, 500, 'easeOutCubic');
            line.tween({ x: config.width * 2 }, 300, 'easeOutCubic');
        };
    }
}

class UINav extends Interface {

    constructor() {
        super('UINav');
        const self = this;
        let project;

        initHTML();
        initLinks();
        addListeners();

        function initHTML() {
            self.size('100%', 70).setZ(20).hide();
        }

        function initLinks() {
            project = self.initClass(UINavLink, { text: 'About', width: 40 });
            project.css({
                top: 25,
                right: 30
            });
        }

        function addListeners() {
            self.events.add(project, Events.CLICK, () => {
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
        let wrapper, nav, about;

        initContainer();
        initView();
        addListeners();
        animateIn();

        function initContainer() {
            self.size('100%').setZ(10).mouseEnabled(false).invisible();
            self.css({
                top: 0,
                left: 0
            });

            wrapper = self.create('.wrapper');
            wrapper.size('100%');
        }

        function initView() {
            nav = self.initClass(UINav);
        }

        function animateIn() {
            self.visible();
            nav.animateIn();
        }

        function addListeners() {
            self.events.add(Events.PHOTO, photo);
            self.events.add(Events.TOGGLE_ABOUT, toggleAbout);
        }

        function photo(e) {
            if (e.open) {
                nav.animateOut();
            } else {
                nav.animateIn();
            }
        }

        function toggleAbout(e) {
            if (e.open) {
                ScrollLock.instance().lock();
                wrapper.tween({ opacity: 0 }, 500, 'easeInOutSine');
                if (about) about.destroy();
                about = self.initClass(UIAbout);
                defer(about.animateIn);
            } else {
                ScrollLock.instance().unlock();
                wrapper.tween({ opacity: 1 }, 800, 'easeInOutSine');
                about.animateOut(() => {
                    about = about.destroy();
                });
            }
        }
    }
}

class Loader extends Interface {

    constructor() {
        super('Loader');
        const self = this;
        let bg, image, caption, title, view;

        initHTML();
        initViews();
        initLoader();
        addListeners();
        defer(animateIn);

        function initHTML() {
            self.size('100%').enable3D(2000).invisible();
            self.css({
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                cursor: 'pointer'
            });

            bg = self.create('.bg');
            bg.css({ top: 70, opacity: 0 }).transform({ z: -300, rotationX: -1, rotationY: 1, rotationZ: -0.5 }).enable3D().mouseEnabled(false);
        }

        function initViews() {
            title = self.initClass(UICaption, '“I’ve seen [Farley Mowat] swim naked among the thousands of Caplin...” &nbsp;—&nbsp;Gerald&nbsp;Richardson');
            view = self.initClass(UILoader);
            caption = self.initClass(UICaptionCard, [title, view]);
        }

        function initLoader() {
            Promise.all([
                FontLoader.loadFonts([
                    { family: 'Source Sans Pro', style: 'normal', weight: '400' },
                    { family: 'Source Sans Pro', style: 'italic', weight: '400' },
                    { family: 'Source Sans Pro', style: 'normal', weight: '600' },
                    { family: 'Crimson Text', style: 'normal', weight: '400' },
                    { family: 'Crimson Text', style: 'italic', weight: '400' },
                    { family: 'Crimson Text', style: 'normal', weight: '600' },
                    //{ family: 'Minion Pro', style: 'normal', weight: 'normal' }
                ]),
                AssetLoader.loadAssets([`assets/data/data.json?${Utils.timestamp()}`])
            ]).then(() => {
                const photos = Assets.getData('data').photos;
                photos.forEach(item => Config.PHOTOS.push(new Photo(item)));

                Data.init();

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
                });
                self.events.add(view, Events.COMPLETE, () => {
                    view.start();
                });
            });
        }

        function click() {
            self.events.remove(Mouse.input, Interaction.CLICK, click);
            Container.instance().start();
        }

        function addListeners() {
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
        }

        async function animateIn() {
            self.visible();
            await caption.animateIn();
        }

        this.animateOut = callback => {
            caption.animateOut();
            bg.tween({ z: -300 }, 700, 'easeInCubic');
            this.tween({ opacity: 0 }, 700, 'easeOutSine', callback);
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
        }

        function initViews() {
            lines = [];

            //const title = wrapper.initClass(UITitle, 'in association with');
            //title.css({ textAlign: 'center' });
            //lines.push(title);
            const text = [
                'This site is dedicated, to our grandfather, Gerald Richardson,',
                'Photographer and filmmaker.',
                'A true influence to us all.'
            ];
            text.forEach((copy, i) => {
                const line = wrapper.initClass(UICaption, copy, i === 0);
                line.css({ textAlign: 'center' });
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
                const line = wrapper.initClass(UICaption, copy, i === 0);
                line.css({ textAlign: 'center' });
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
            button = self.initClass(UIButton, (Device.mobile ? 'Tap' : 'Click') + ' to skip');
            caption = self.initClass(UICaptionCard, [title, button]);
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
        let player, intro1, intro2, loader, wrapper, lines;

        initContainer();
        initViews();
        addListeners();

        function initContainer() {
            Stage.allowScroll();
            Stage.css({ position: '', overflow: '' });
            self.size('100%', 'auto').mouseEnabled(true);
            self.css({ paddingBottom: 70 });
            Stage.add(self);
            window.history.scrollRestoration = 'manual';

            wrapper = self.create('.wrapper');
            wrapper.css({
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
            self.events.add(Events.RESIZE, resize);
            self.events.add(Events.PHOTO, photo);
            //window.addEventListener('scroll', scroll);
            resize();
        }

        function resize() {
            wrapper.size(window.innerWidth, 'auto');
        }

        function photo(e) {
            if (e.open) {
                self.mouseEnabled(false);
                ScrollLock.instance().lock();
            } else {
                self.mouseEnabled(true);
                ScrollLock.instance().unlock();
            }
        }

        /*function scroll() {
            const scrollElement = document.scrollingElement || document.documentElement;
            wrapper.css({ x: scrollElement.scrollLeft });
            rows.forEach(row => row.scroll(scrollElement.scrollLeft));
        }*/

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
                '60 years behind the camera'
            ];
            text.forEach((copy, i) => {
                const line = wrapper.initClass(UICaption, copy, i === 0);
                line.css({ textAlign: 'center' });
                if (i === 1) line.css({ marginTop: 10 });
                lines.push(line);
            });

            ['1950s Royals', '1939 Royal Visit', 'Navy', 'Fashion', 'Portraits of Grandpa', 'Film and Television', 'People'].forEach(tag => {
                const matched = [];
                Config.PHOTOS.forEach(item => {
                    if (~item.type.toLowerCase().indexOf(tag.toLowerCase())) matched.push(item);
                });
                createRow(matched, tag);
            });

            await self.wait(2000);
            let delay = 0;
            lines.forEach(line => {
                line.promise = line.animateIn(delay);
                delay += 500;
            });
            await lines.last().promise;

            self.initClass(UI);
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

        Accelerometer.init();
        Mouse.init();
        init();

        function init() {
            Container.instance();
        }
    }
}

new Main();
