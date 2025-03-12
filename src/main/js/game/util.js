define([ ], function(){
        /**
         * @function keepSameSizeWithMTMText
         * @description keep some sprite font size is the same as MTM text
         * @instance
         * @param sprite{object} - the sprite needs to keep same as MTM text
         * @gladPixiRenderer gladPixiRenderer{object}
         */
        function keepSameSizeWithMTMText(sprite, gladPixiRenderer) {
            var gr = gladPixiRenderer;
            if (gr.lib._MTMText) {
                var xScale = gr.lib._MTMText.pixiContainer.$text.scale._x;
                var sText;
                if (sprite) {
                    var sst = sprite._currentStyle;
                    var sp = sprite.pixiContainer;
                    var spWidth = Number(sst._width);
                    var spHeight = Number(sst._height);
                    sText = sp.$text;
                    sText.scale.set(xScale);
    
                    sText.y = Math.floor(spHeight/2);
                    var align = sText.style.align;
                    if (align === 'right') {
                        sText.x = spWidth - Math.floor(sText.width/2);
                    } else if (align === 'center') {
                        sText.x = spWidth/2;
                    } else {
                        sText.x = Math.floor(sText.width/2);
                    }
                }
            }
        }
       
    
        return{
            keepSameSizeWithMTMText:keepSameSizeWithMTMText
        };
    });
    
    