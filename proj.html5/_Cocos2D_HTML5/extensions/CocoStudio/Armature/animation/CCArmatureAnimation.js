/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

//movement event type
ccs.MovementEventType = {
    start: 0,
    complete: 1,
    loopComplete: 2
};
/**
 * Base class for cc.MovementEvent objects.
 * @class
 * @extends cc.Class
 */
ccs.AnimationEvent = cc.Class.extend({
    _arguments:null,
    _callFunc:null,
    _selectorTarget:null,
    ctor:function (target, callFunc, data) {
        this._data = data;
        this._callFunc = callFunc;
        this._selectorTarget = target;
    },
    call:function () {
        if (this._callFunc) {
            this._callFunc.apply(this._selectorTarget, this._arguments);
        }
    },
    setArguments:function (args) {
        this._arguments = args;
    }
});
ccs.FrameEvent = function () {
    this.bone = null;
    this.frameEventName = "";
    this.originFrameIndex = 0;
    this.currentFrameIndex = 0;
};
/**
 * Base class for ccs.ArmatureAnimation objects.
 * @class
 * @extends ccs.ProcessBase
 */
ccs.ArmatureAnimation = ccs.ProcessBase.extend({
    _animationData:null,
    _movementData:null,
    _armature:null,
    _movementID:"",
    _prevFrameIndex:0,
    _toIndex:0,
    _tweenList:null,
    _frameEvent:null,
    _movementEvent:null,
    _speedScale:1,
    _ignoreFrameEvent:false,
    _frameEventQueue:[],
    _userObject:null,
    ctor:function () {
        ccs.ProcessBase.prototype.ctor.call(this);
        this._animationData = null;
        this._movementData = null;
        this._movementID = "";
        this._armature = null;
        this._prevFrameIndex = 0;
        this._toIndex = 0;
        this._tweenList = [];
        this._frameEvent = null;
        this._movementEvent = null;
        this._speedScale = 1;
        this._ignoreFrameEvent = false;
        this._frameEventQueue = [];
        this._userObject = null;
    },

    /**
     * init with a CCArmature
     * @param {ccs.Armature} armature
     * @return {Boolean}
     */
    init:function (armature) {
        this._armature = armature;
        this._tweenList = [];
        return true;
    },
    pause:function () {
        for (var i = 0; i < this._tweenList.length; i++) {
            this._tweenList[i].pause();
        }
        ccs.ProcessBase.prototype.pause.call(this);
    },
    resume:function () {
        for (var i = 0; i < this._tweenList.length; i++) {
            this._tweenList[i].resume();
        }
        ccs.ProcessBase.prototype.resume.call(this);
    },

    stop:function () {
        for (var i = 0; i < this._tweenList.length; i++) {
            this._tweenList[i].stop();
        }
        this._tweenList = [];
        ccs.ProcessBase.prototype.stop.call(this);
    },

    /**
     * scale animation play speed
     * @param {Number} speedScale
     */
    setSpeedScale:function (speedScale) {
        if (speedScale == this._speedScale) {
            return;
        }
        this._speedScale = speedScale;
        this._processScale = !this._movementData ? this._speedScale : this._speedScale * this._movementData.scale;
        var dict = this._armature.getBoneDic();
        for (var key in dict) {
            var bone = dict[key];
            bone.getTween().setProcessScale(this._processScale);
            if (bone.getChildArmature()) {
                bone.getChildArmature().getAnimation().setProcessScale(this._processScale);
            }
        }
    },

    getSpeedScale:function(){
        return this._speedScale;
    },

    getAnimationScale:function(){
        return this.getSpeedScale();
    },
    setAnimationScale:function(animationScale){
        return this.setSpeedScale(animationScale);
    },

    setAnimationInternal:function (animationInternal) {
        if (animationInternal == this._animationInternal) {
            return;
        }
        this._animationInternal = animationInternal;

        var dict = this._armature.getBoneDic();
        for (var key in dict) {
            var bone = dict[key];
            bone.getTween().setAnimationInternal(this._animationInternal);
            if (bone.getChildArmature()) {
                bone.getChildArmature().getAnimation().setAnimationInternal(this._animationInternal);
            }
        }
    },

    /**
     * play animation by animation name.
     * @param {Number} animationName The animation name you want to play
     * @param {Number} durationTo
     *         he frames between two animation changing-over.It's meaning is changing to this animation need how many frames
     *         -1 : use the value from CCMovementData get from flash design panel
     * @param {Number} durationTween he
     *         frame count you want to play in the game.if  _durationTween is 80, then the animation will played 80 frames in a loop
     *         -1 : use the value from CCMovementData get from flash design panel
     * @param {Number} loop
     *          Whether the animation is loop.
     *         loop < 0 : use the value from CCMovementData get from flash design panel
     *         loop = 0 : this animation is not loop
     *         loop > 0 : this animation is loop
     * @param {Number} tweenEasing
     *          CCTween easing is used for calculate easing effect
     *         TWEEN_EASING_MAX : use the value from CCMovementData get from flash design panel
     *         -1 : fade out
     *         0  : line
     *         1  : fade in
     *         2  : fade in and out
     */
    play:function (animationName, durationTo, durationTween, loop, tweenEasing) {
        if (this._animationData == null) {
            cc.log("this._animationData can not be null");
            return;
        }
        this._movementData = this._animationData.getMovement(animationName);
        if (this._movementData == null) {
            cc.log("this._movementData can not be null");
            return;
        }
        if (typeof durationTo == "undefined") {
            durationTo = -1;
        }
        if (typeof durationTween == "undefined") {
            durationTween = -1;
        }
        if (typeof loop == "undefined") {
            loop = -1;
        }
        if (typeof tweenEasing == "undefined") {
            tweenEasing = ccs.TweenType.tweenEasingMax;
        }
        var locMovementData = this._movementData;
        //Get key frame count
        this._rawDuration = locMovementData.duration;
        this._movementID = animationName;
        this._processScale = this._speedScale * locMovementData.scale;
        //Further processing parameters
        durationTo = (durationTo == -1) ? locMovementData.durationTo : durationTo;
        durationTween = (durationTween == -1) ? locMovementData.durationTween : durationTween;
        durationTween = (durationTween == 0) ? locMovementData.duration : durationTween;//todo
        tweenEasing = (tweenEasing == ccs.TweenType.tweenEasingMax) ? locMovementData.tweenEasing : tweenEasing;
        loop = (loop < 0) ? locMovementData.loop : loop;

        ccs.ProcessBase.prototype.play.call(this, durationTo, durationTween, loop, tweenEasing);

        if (this._rawDuration == 0) {
            this._loopType = CC_ANIMATION_TYPE_SINGLE_FRAME;
        }
        else {
            if (loop) {
                this._loopType = CC_ANIMATION_TYPE_TO_LOOP_FRONT;
            }
            else {
                this._loopType = CC_ANIMATION_TYPE_NO_LOOP;
                this._rawDuration--;
            }
            this._durationTween = durationTween;
        }

        this._tweenList = [];

        var movementBoneData;
        var dict = this._armature.getBoneDic();
        for (var key in dict) {
            var bone = dict[key];
            movementBoneData = locMovementData.getMovementBoneData(bone.getName());
            var tween = bone.getTween();
            if (movementBoneData && movementBoneData.frameList.length > 0) {
                this._tweenList.push(tween);
                movementBoneData.duration = locMovementData.duration;
                tween.play(movementBoneData, durationTo, durationTween, loop, tweenEasing);

                tween.setProcessScale(this._processScale);
                tween.setAnimationInternal(this._animationInternal);
                if (bone.getChildArmature()) {
                    bone.getChildArmature().getAnimation().setProcessScale(this._processScale);
                    bone.getChildArmature().getAnimation().setAnimationInternal(this._animationInternal);
                }
            } else {
                if (!bone.getIgnoreMovementBoneData()) {
                    bone.getDisplayManager().changeDisplayByIndex(-1, false);
                    tween.stop();
                }
            }
        }
        this._armature.update(0);
    },

    /**
     * Go to specified frame and play current movement.
     * You need first switch to the movement you want to play, then call this function.
     *
     * example : playByIndex(0);
     *           gotoAndPlay(0);
     *           playByIndex(1);
     *           gotoAndPlay(0);
     *           gotoAndPlay(15);
     * @param {Number} frameIndex
     */
    gotoAndPlay: function (frameIndex) {
        if (!this._movementData || frameIndex < 0 || frameIndex >= this._movementData.duration) {
            cc.log("Please ensure you have played a movement, and the frameIndex is in the range.");
            return;
        }

        var ignoreFrameEvent = this._ignoreFrameEvent;
        this._ignoreFrameEvent = true;
        this._isPlaying = true;
        this._isComplete = this._isPause = false;

        ccs.ProcessBase.prototype.gotoFrame.call(this, frameIndex);
        this._currentPercent = this._curFrameIndex / this._movementData.duration;
        this._currentFrame = this._nextFrameIndex * this._currentPercent;

        for (var i = 0; i < this._tweenList.length; i++) {
            var tween = this._tweenList[i];
            tween.gotoAndPlay(frameIndex);
        }
        this._armature.update(0);
        this._ignoreFrameEvent = ignoreFrameEvent;
    },

    /**
     * Go to specified frame and pause current movement.
     * @param {Number} frameIndex
     */
    gotoAndPause: function (frameIndex) {
        this.gotoAndPlay(frameIndex);
        this.pause();
    },

    /**
     * Play animation by index, the other param is the same to play.
     * @param {Number} animationIndex
     * @param {Number} durationTo
     * @param {Number} durationTween
     * @param {Number} loop
     * @param {Number} tweenEasing
     */
    playByIndex:function (animationIndex, durationTo, durationTween, loop, tweenEasing) {
        if (typeof durationTo == "undefined") {
            durationTo = -1;
        }
        if (typeof durationTween == "undefined") {
            durationTween = -1;
        }
        if (typeof loop == "undefined") {
            loop = -1;
        }
        if (typeof tweenEasing == "undefined") {
            tweenEasing = 10000;
        }
        var moveNames = this._animationData.movementNames;
        if (animationIndex < -1 || animationIndex >= moveNames.length) {
            return;
        }
        var animationName = moveNames[animationIndex];
        this.play(animationName, durationTo, durationTween, loop, tweenEasing);
    },

    /**
     * get movement count
     * @return {Number}
     */
    getMovementCount:function () {
        return this._animationData.getMovementCount();
    },

    update:function (dt) {
        if(ccs.ProcessBase.prototype.update.call(this, dt)){
            for (var i = 0; i < this._tweenList.length; i++) {
                this._tweenList[i].update(dt);
            }
        }
        if (this._frameEventQueue.length > 0) {
            for (var i = 0; i < this._frameEventQueue.length; i++) {
                var frameEvent = this._frameEventQueue[i];
                this._ignoreFrameEvent = true;
                this.callFrameEvent([frameEvent.bone, frameEvent.frameEventName, frameEvent.originFrameIndex, frameEvent.currentFrameIndex]);
                this._ignoreFrameEvent = false;
            }
            this._frameEventQueue = [];
        }
    },

    /**
     * update will call this handler, you can handle your logic here
     */
    updateHandler:function () {
        var locCurrentPercent = this._currentPercent;
        if (locCurrentPercent >= 1) {
            switch (this._loopType) {
                case CC_ANIMATION_TYPE_NO_LOOP:
                    this._loopType = CC_ANIMATION_TYPE_MAX;
                    this._currentFrame = (locCurrentPercent - 1) * this._nextFrameIndex;
                    locCurrentPercent = this._currentFrame / this._durationTween;
                    if (locCurrentPercent < 1.0) {
                        this._nextFrameIndex = this._durationTween;
                        this.callMovementEvent([this._armature, ccs.MovementEventType.start, this._movementID]);
                        break;
                    }
                case CC_ANIMATION_TYPE_MAX:
                case CC_ANIMATION_TYPE_SINGLE_FRAME:
                    locCurrentPercent = 1;
                    this._isComplete = true;
                    this._isPlaying = false;
                    this.callMovementEvent([this._armature, ccs.MovementEventType.complete, this._movementID]);
                    break;
                case CC_ANIMATION_TYPE_TO_LOOP_FRONT:
                    this._loopType = CC_ANIMATION_TYPE_LOOP_FRONT;
                    locCurrentPercent = ccs.fmodf(locCurrentPercent, 1);
                    this._currentFrame = this._nextFrameIndex == 0 ? 0 : ccs.fmodf(this._currentFrame, this._nextFrameIndex);
                    this._nextFrameIndex = this._durationTween > 0 ? this._durationTween : 1;
                    this.callMovementEvent([this, ccs.MovementEventType.start, this._movementID]);
                    break;
                default:
                    //locCurrentPercent = ccs.fmodf(locCurrentPercent, 1);
                    this._currentFrame = ccs.fmodf(this._currentFrame, this._nextFrameIndex);
                    this._toIndex = 0;
                    this.callMovementEvent([this._armature, ccs.MovementEventType.loopComplete, this._movementID]);
                    break;
            }
            this._currentPercent = locCurrentPercent;
        }
    },

    /**
     * Get current movementID
     * @returns {String}
     */
    getCurrentMovementID: function () {
        if (this._isComplete)
            return "";
        return this._movementID;
    },

    /**
     * connect a event
     * @param {Object} target
     * @param {function} callFunc
     */
    setMovementEventCallFunc:function (callFunc, target) {
        this._movementEvent = new ccs.AnimationEvent(target, callFunc);
    },

    /**
     * call event
     * @param {Array} args
     */
    callMovementEvent:function (args) {
        if (this._movementEvent) {
            this._movementEvent.setArguments(args);
            this._movementEvent.call();
        }
    },

    /**
     * connect a event
     * @param {Object} target
     * @param {function} callFunc
     */
    setFrameEventCallFunc:function (callFunc, target) {
        this._frameEvent = new ccs.AnimationEvent(target, callFunc);
    },

    /**
     * call event
     * @param {Array} args
     */
    callFrameEvent:function (args) {
        if (this._frameEvent) {
            this._frameEvent.setArguments(args);
            this._frameEvent.call();
        }
    },

    /**
     * @param {ccs.Bone} bone
     * @param {String} frameEventName
     * @param {Number} originFrameIndex
     * @param {Number} currentFrameIndex
     */
    frameEvent:function(bone, frameEventName,  originFrameIndex,  currentFrameIndex){
        if (this._frameEvent)    {
            var frameEvent = new ccs.FrameEvent();
            frameEvent.bone = bone;
            frameEvent.frameEventName = frameEventName;
            frameEvent.originFrameIndex = originFrameIndex;
            frameEvent.currentFrameIndex = currentFrameIndex;
            this._frameEventQueue.push(frameEvent);
        }
    },
    
    /**
     * animationData setter
     * @param {ccs.AnimationData} aniData
     */
    setAnimationData:function (aniData) {
        this._animationData = aniData;
    },

    /**
     * animationData getter
     * @return {ccs.AnimationData}
     */
    getAnimationData:function () {
        return this._animationData;
    },
    /**
     * userObject setter
     * @param {Object} aniData
     */
    setUserObject:function (userObject) {
        this._userObject = userObject;
    },

    /**
     * userObject getter
     * @return {Object}
     */
    getUserObject:function () {
        return this._userObject;
    },

    isIgnoreFrameEvent:function(){
        return this._ignoreFrameEvent;
    },

    setIgnoreFrameEvent:function(bool){
        this._ignoreFrameEvent = bool;
    }
});

/**
 * allocates and initializes a ArmatureAnimation.
 * @constructs
 * @return {ccs.ArmatureAnimation}
 * @example
 * // example
 * var animation = ccs.ArmatureAnimation.create();
 */
ccs.ArmatureAnimation.create = function (armature) {
    var animation = new ccs.ArmatureAnimation();
    if (animation && animation.init(armature)) {
        return animation;
    }
    return null;
};