var Game = function(init)
{
  var default_init =
  {
    width:640,
    height:320,
    container:"stage_container"
  }

  var self = this;
  doMapInitDefaults(init,init,default_init);

  var stage = new Stage({width:init.width,height:init.height,container:init.container});
  var scenes = [new NullScene(self, stage), new LoadingScene(self, stage), /*new TestScene(self, stage),*/ /*new ExperimentScene(self, stage),*/ new GamePlayScene(self, stage) ];
  var cur_scene = 0;
  var old_cur_scene = -1;

  self.begin = function()
  {
    self.nextScene();
    tick();
  };

  var tick = function()
  {
    requestAnimFrame(tick,stage.dispCanv.canvas);
    //stage.clear();
    stage.drawCanv.clear();
    stage.dispCanv.context.fillStyle = "rgba(255,255,255,0.1)";
    stage.dispCanv.context.fillRect(0,0,stage.dispCanv.canvas.width,stage.dispCanv.canvas.height);
    scenes[cur_scene].tick();
    scenes[cur_scene].draw();
    if(old_cur_scene == cur_scene) //still in same scene- draw
    {
      scenes[cur_scene].draw();
      stage.draw(); //blits from offscreen canvas to on screen one
    }
    old_cur_scene = cur_scene;
  };

  self.nextScene = function()
  {
    scenes[cur_scene].cleanup();
    cur_scene++;
    scenes[cur_scene].ready();
  };
};

