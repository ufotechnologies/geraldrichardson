/**
 * Gerald Richardson — 60 years behind the camera.
 *
 * @author Patrick Schroen / https://github.com/pschroen
 */

import { Events, Stage, Interface, Device, Interaction, Mouse, Accelerometer, Utils,
    Assets, Video, AssetLoader, FontLoader, StateDispatcher, Vector2 } from '../alien.js/src/Alien.js';

Config.UI_OFFSET = Device.phone ? 15 : 25;
Config.PHOTOS = [];
Config.ASSETS = [
    'assets/images/arrow.png',
    'assets/images/logo_thestar.png',
    'assets/images/logo_myseum.png',
    'assets/images/logo_nfb.png'
];

Events.TOGGLE_VIDEO = 'toggle_video';


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

class UIPhotoCard extends Interface {

    constructor(data) {
        super('.UIPhotoCard');
        const self = this;
        let container;

        initHTML();
        initViews();
        addListeners();

        function initHTML() {
            self.invisible();
            self.css({
                padding: 10
            });
            container = self.create('.container');
            container.size('100%').setZ(2);
            container.css({
                position: 'relative',
                overflow: 'hidden'
            });
            container.bg(data.image, 'cover');
        }

        function initViews() {
        }

        function addListeners() {
        }

        this.resize = () => {
            this.size();
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

class UICarousel extends Interface {

    constructor(photos) {
        super('.UICarousel');
        const self = this;
        let current, left, right, prev,
            index = 0;

        initHTML();
        initCarousel();
        initArrows();
        addListeners();

        function initHTML() {
            self.size('100%', 340).mouseEnabled(true);
            self.css({ position: 'relative' }).bg('#0a1014');
        }

        function initCarousel() {
            AssetLoader.loadAssets(photos.map(item => item.image));
            current = self.initClass(UIPhotoCard, photos[0], self);
        }

        function initArrows() {
            left = self.initClass(UIArrow, true);
            right = self.initClass(UIArrow, false);
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
            if (Device.phone) {
                left.css({
                    left: '50%',
                    top: '50%',
                    marginLeft: -(current.width / 2 - 10),
                    marginTop: -15,
                    zIndex: 200
                });
                right.css({
                    left: '50%',
                    top: '50%',
                    marginLeft: current.width / 2 - 40,
                    marginTop: -15,
                    zIndex: 200
                });
            } else {
                left.css({
                    left: '50%',
                    top: '50%',
                    marginLeft: -(current.width / 2 + 30),
                    marginTop: -15,
                    zIndex: 200
                });
                right.css({
                    left: '50%',
                    top: '50%',
                    marginLeft: current.width / 2,
                    marginTop: -15,
                    zIndex: 200
                });
            }
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
            text.text(copy);
        }

        this.update = e => {
            text.text(e);
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
                fontWeight: '600',
                lineHeight: size * 1.5,
                letterSpacing: 1,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
            });
            text.text(copy);
        }

        this.update = e => {
            text.text(e);
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

    constructor(copy = '') {
        super('.UICaption');
        const self = this;
        const size = 14;
        let text;

        initHTML();
        initText();

        function initHTML() {
            self.css({ position: 'relative', opacity: 0 });
        }

        function initText() {
            text = self.create('.text');
            text.fontStyle('Source Sans Pro', size, '#000', 'italic');
            text.css({
                position: 'relative',
                lineHeight: size * 1.4,
                letterSpacing: size * 0.035
            });
            text.text(copy);
        }

        this.update = e => {
            text.text(e);
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
                if (this.progress === 1) this.events.fire(Events.COMPLETE);
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
            self.size(290, 'auto').css({ left: Config.UI_OFFSET, bottom: Config.UI_OFFSET });
            self.bg('#fff');

            self.inner = self.create('.inner');
            self.inner.css({ position: 'relative', margin: '10px 20px 40px' });
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

class Loader extends Interface {

    constructor() {
        super('Loader');
        const self = this;
        const mouse = new Vector2();
        let bg, caption, title, view, overlay;

        initHTML();
        initViews();
        initLoader();
        defer(animateIn);

        function initHTML() {
            self.size('100%').setZ(1).enable3D(2000).invisible();
            self.css({
                cursor: 'pointer',
                filter: 'grayscale(100%)'
            });

            bg = self.create('.bg');
            bg.scale = 1.1;
            //bg.size('100%').css({ opacity: 0 }).transform({ z: -100 }).mouseEnabled(false);
            bg.size('100%').css({ opacity: 0 }).transform({ z: -400, rotationX: -1, rotationY: 1, rotationZ: -0.5 }).enable3D().mouseEnabled(false);
            bg.bg('assets/images/intro/bg.jpg', 'cover');

            overlay = self.create('.overlay');
            overlay.val = 0;
            //overlay.size('100%').css({ background: 'radial-gradient(transparent 0%, #fff 0%)' });
        }

        function initViews() {
            title = self.initClass(UICaption, '“I’ve seen [Farley Mowat] swim naked among the thousands of Caplin...”');
            view = self.initClass(UILoader);
            caption = self.initClass(UICaptionCard, [title, view]);
        }

        function initLoader() {
            Promise.all([
                FontLoader.loadFonts([
                    { family: 'Source Sans Pro', style: 'normal', weight: '400' },
                    { family: 'Source Sans Pro', style: 'italic', weight: '400' },
                    { family: 'Source Sans Pro', style: 'normal', weight: '600' }
                ]),
                AssetLoader.loadAssets([`assets/data/data.json?${Utils.timestamp()}`])
            ]).then(() => {
                const photos = Assets.getData('data').photos;
                photos.forEach(item => Config.PHOTOS.push(new Photo(item)));

                Data.init();

                const loader = self.initClass(AssetLoader, Config.ASSETS);
                AssetLoader.loadAssets(['assets/images/intro/bg.jpg']).then(() => {
                    bg.tween({ opacity: 1 }, 800, 'easeOutSine', 100);
                    bg.tween({ z: -300, rotationZ: 0 }, 7000, 'easeOutCubic');
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

        function loop() {
            /*let x, y;
            if (Device.mobile) {
                mouse.lerp(Accelerometer, 0.1);
                x = Math.range(mouse.x, -5, 5, 0, Stage.width, true);
                y = Math.range(mouse.y, -10, 10, 0, Stage.height, true);
            } else {
                mouse.lerp(Mouse, 0.05);
                x = mouse.x;
                y = mouse.y;
            }

            if (Device.mobile) {
                bg.x = Math.range(x, 0, Stage.width, 5, -5);
                bg.rotationY = Math.range(x, 0, Stage.width, -10, 10) * 0.5;
                bg.rotationX = Math.range(y, 0, Stage.height, 5, -5) * 0.5;
            } else {
                bg.x = Math.range(x, 0, Stage.width, 25, -25);
                bg.rotationY = Math.range(x, 0, Stage.width, -10, 10) * 0.15;
                bg.rotationX = Math.range(y, 0, Stage.height, 5, -5) * 0.15;
            }
            bg.transform();*/

            //overlay.css({ background: `radial-gradient(transparent ${100 * overlay.val}%, #fff ${120 * overlay.val}%)` });
        }

        async function animateIn() {
            self.startRender(loop);
            self.visible();
            tween(overlay, { val: 1 }, 2500, 'easeInOutSine');
            await caption.animateIn();
        }

        this.animateOut = callback => {
            caption.animateOut();
            this.tween({ opacity: 0 }, 700, 'easeOutSine', () => {
                this.stopRender(loop);
                if (callback) callback();
            });
        };
    }
}

class IntroLogo extends Interface {

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
}

class Intro extends Interface {

    constructor() {
        super('Intro');
        const self = this;
        let wrapper, lines;

        initHTML();
        initViews();

        function initHTML() {
            self.size('100%').bg('#fff').css({ cursor: 'pointer' });

            wrapper = self.create('.wrapper');
        }

        function initViews() {
            lines = [];

            const title = wrapper.initClass(UITitle, 'in association with');
            title.css({ textAlign: 'center' });
            lines.push(title);

            const logos = [
                { image: 'assets/images/logo_thestar.png', width: 187, height: 21 },
                { image: 'assets/images/logo_myseum.png', width: 124, height: 124 },
                { image: 'assets/images/logo_nfb.png', width: 74, height: 36 }
            ];
            logos.forEach((logo, i) => {
                const line = wrapper.initClass(IntroLogo, logo);
                if (i === 0) line.css({ marginTop: 20 });
                lines.push(line);
            });

            wrapper.size().center();
        }

        this.animateIn = async () => {
            await this.wait(100);
            let delay = 0;
            lines.forEach(line => {
                line.promise = line.animateIn(delay);
                delay += 500;
            });
            await lines.last().promise;
        };

        this.animateOut = async callback => {
            lines.reverse();
            let delay = 0;
            lines.forEach(line => {
                line.promise = line.animateOut(delay);
                delay += 250;
            });
            await lines.last().promise;
            this.tween({ opacity: 0 }, 700, 'easeOutSine', callback);
        };
    }
}

class PierreBertonVideo extends Interface {

    constructor() {
        super('PierreBertonVideo');
        const self = this;
        let media, player, caption, title, button;

        function initHTML() {
            self.hide();
            self.css({
                cursor: 'pointer',
                filter: 'grayscale(100%)',
                opacity: 0
            });

            media = self.create('fullscreen-video');
            media.size('100%').bg('#fff');
        }

        function initViews() {
            title = self.initClass(UICaption, '“Great Days On King” — Pierre Berton');
            button = self.initClass(UIButton, (Device.mobile ? 'Tap' : 'Click') + ' to skip');
            caption = self.initClass(UICaptionCard, [title, button]);
        }

        function addListeners() {
            self.events.add(Events.RESIZE, resize);
            self.events.add(Mouse.input, Interaction.CLICK, ended);
            resize();
        }

        function resize() {
            self.size(Stage.width, Stage.height);
            self.css({ opacity: self.animatedIn ? 1 : 0 });
        }

        function ended() {
            animateOut(() => {
                self.hide();
                self.events.fire(Events.TOGGLE_VIDEO, { open: false });
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
            const promise = player.play();
            if (promise) {
                promise.catch(() => {
                    //player.mute();
                    //player.play();
                });
            }
        }

        async function animateIn() {
            self.animatedIn = true;
            self.show().tween({ opacity: 1 }, 700, 'easeOutSine');
            await caption.animateIn();
        }

        function animateOut(callback) {
            caption.animateOut();
            self.tween({ opacity: 0 }, 550, 'easeOutSine', callback);
        }

        this.close = callback => {
            if (player && player.stop) player.stop();
            if (callback) callback();
        };

        this.start = () => {
            initHTML();
            initViews();
            addListeners();
            this.events.fire(Events.TOGGLE_VIDEO, { open: true });
            this.delayedCall(initVideo, 500);
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
        const carousels = [];
        let player, intro, loader;

        initContainer();
        initPlayer();
        initIntro();
        initLoader();

        function initContainer() {
            self.css({ position: 'static' });
            Stage.add(self);
        }

        function initPlayer() {
            player = self.initClass(PierreBertonVideo);
        }

        function initIntro() {
            intro = self.initClass(Intro);
        }

        function initLoader() {
            loader = self.initClass(Loader);
        }

        function closeVideo() {
            self.events.remove(Events.TOGGLE_VIDEO, closeVideo);
            if (player && player.close) player.close(() => player.destroy());

            const carousel = self.initClass(UICarousel, Config.PHOTOS);
            carousel.animateIn();
            carousels.push(carousel);
        }

        this.start = () => {
            player.start();
            self.events.add(Events.TOGGLE_VIDEO, closeVideo);

            loader.animateOut(async () => {
                loader = loader.destroy();

                await intro.animateIn();
                await this.wait(2000);
                await intro.animateOut();
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
