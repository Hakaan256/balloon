var GamePlayScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;

  var inc_mass = true;

  //config
  var n_particles;
  var p_size;
  var m_size;
  var p_vel;
  var m_vel;
  var m_m;
  var friction;
  var gravity;

  //derivable from config
  var hp_size;
  var hm_size;
  var pCollideDistSqr;
  var pmCollideDistSqr;

  //utils
  var ball_canv;
  var mass_canv;

  //doqueues
  var dragger;

  //objects
  var particles;
  var mass;

  //ui
  var n_particles_slider;
  var p_size_slider;
  var m_size_slider;
  var p_vel_slider;
  var m_vel_slider;
  var m_m_slider;

  self.ready = function()
  {
    //config
    n_particles = 1000;
    p_size = 0.02;
    m_size = 0.02;
    p_vel = 0.005;
    m_vel = 0.005;
    m_m = 10;
    gravity = 0.0001;
    friction = 0.999;

    //derivable from config
    function rederiveConfig()
    {
      hp_size = p_size/2;
      hm_size = m_size/2;
      pCollideDistSqr = p_size; pCollideDistSqr *= pCollideDistSqr;
      pmCollideDistSqr = (p_size+m_size)/2; pmCollideDistSqr *= pmCollideDistSqr;
    }
    rederiveConfig();

    //utils
    ball_canv = document.createElement('canvas');
    ball_canv.width = 20;
    ball_canv.height = 20;
    ball_canv.context = ball_canv.getContext('2d');
    ball_canv.context.fillStyle = "#FF0000";
    ball_canv.context.beginPath();
    ball_canv.context.arc(ball_canv.width/2,ball_canv.height/2,ball_canv.width/2,0,2*Math.PI);
    ball_canv.context.fill();

    mass_canv = document.createElement('canvas');
    mass_canv.width = 40;
    mass_canv.height = 40;
    mass_canv.context = mass_canv.getContext('2d');
    mass_canv.context.fillStyle = "#0000FF";
    mass_canv.context.beginPath();
    mass_canv.context.arc(mass_canv.width/2,mass_canv.height/2,mass_canv.width/2,0,2*Math.PI);
    mass_canv.context.fill();

    //doqueues
    dragger = new Dragger({source:stage.dispCanv.canvas});

    //objects
    particles = [];
    for(var i = 0; i < n_particles; i++)
      particles.push(new Particle(Math.random(),Math.random(),(Math.random()*p_vel*2)-p_vel,(Math.random()*p_vel*2)-p_vel));
    if(inc_mass)
    {
      mass = new DraggableMass(Math.random(),Math.random(),(Math.random()*m_vel*2)-m_vel,(Math.random()*m_vel*2)-m_vel,m_m);
      dragger.register(mass);
    }

    //ui
    n_particles_slider = new SmoothSliderBox(10, 10,100,20,     0, n_particles, n_particles, function(n){ n_particles = Math.round(n); });
    p_size_slider      = new SmoothSliderBox(10, 40,100,20, 0.005,         0.1,      p_size, function(n){ p_size = n; rederiveConfig(); });
    m_size_slider      = new SmoothSliderBox(10, 70,100,20, 0.005,         0.2,      m_size, function(n){ m_size = n; rederiveConfig(); });
    p_vel_slider       = new SmoothSliderBox(10,100,100,20, 0.002,        0.01,       p_vel, function(n){ p_vel = n; });
    m_vel_slider       = new SmoothSliderBox(10,130,100,20, 0.002,        0.01,       m_vel, function(n){ m_vel = n; });
    m_m_slider         = new SmoothSliderBox(10,160,100,20, 0.001,       10000,         m_m, function(n){ m_m = n; });
    gravity_slider     = new SmoothSliderBox(10,190,100,20,     0,        0.01,         m_m, function(n){ gravity = n; });
    friction_slider    = new SmoothSliderBox(10,210,100,20,     0,           1,         m_m, function(n){ friction = n; });

    dragger.register(n_particles_slider);
    dragger.register(p_size_slider);
    dragger.register(m_size_slider);
    dragger.register(p_vel_slider);
    dragger.register(m_vel_slider);
    dragger.register(m_m_slider);
    dragger.register(gravity_slider);
    dragger.register(friction_slider);
  };

  self.tick = function()
  {
    dragger.flush();

    n_particles_slider.tick();
    p_size_slider.tick();
    m_size_slider.tick();
    p_vel_slider.tick();
    m_vel_slider.tick();
    m_m_slider.tick();
    gravity_slider.tick();
    friction_slider.tick();

    //movement
    for(var i = 0; i < n_particles; i++)
      moveMass(particles[i]);
    if(inc_mass) moveMass(mass);

    //gravity
    for(var i = 0; i < n_particles; i++)
      gravitateMass(particles[i]);
    if(inc_mass) gravitateMass(mass);

    //collision - bounce
    for(var i = 0; i < n_particles; i++)
      for(var j = i+1; j < n_particles; j++)
        collideParticles(particles[i],particles[j]);
    if(inc_mass)
    {
      for(var i = 0; i < n_particles; i++)
        collideParticleMass(particles[i],mass);
    }

    //friction
    for(var i = 0; i < n_particles; i++)
      frictionMass(particles[i]);
    if(inc_mass) frictionMass(mass);

    //edge detection
    var p;
    for(var i = 0; i < n_particles; i++)
      collideParticleEdge(particles[i]);
    if(inc_mass) collideMassEdge(mass);
  };

  self.draw = function()
  {
    var pw = p_size * dc.width;
    var ph = p_size * dc.height;
    var hpw = pw/2;
    var hph = ph/2;
    dc.context.fillStyle = "#000000";
    for(var i = 0; i < n_particles; i++)
      dc.context.drawImage(ball_canv,particles[i].wx*dc.width-hpw,dc.height-(particles[i].wy*dc.height)-hph,pw,ph);

    if(inc_mass)
    {
      dc.context.fillStyle = "rgba(255,0,0,0.5)";
      mass.x = mass.wx*dc.width-mass.w/2;
      mass.y = dc.height-(mass.wy*dc.height)-mass.h/2;
      mass.w = m_size*dc.width;
      mass.h = m_size*dc.height;
      dc.context.drawImage(mass_canv,mass.x,mass.y,mass.w,mass.h);
    }

    n_particles_slider.draw(dc);
    p_size_slider.draw(dc);
    m_size_slider.draw(dc);
    p_vel_slider.draw(dc);
    m_vel_slider.draw(dc);
    m_m_slider.draw(dc);
    gravity_slider.draw(dc);
    friction_slider.draw(dc);
  };

  self.cleanup = function()
  {
  };


// DATA

  var Particle = function(wx,wy,wxv,wyv)
  {
    this.wx = wx;
    this.wy = wy;
    this.wxv = wxv;
    this.wyv = wyv;
  }
  var Mass = function(wx,wy,wxv,wyv,m)
  {
    this.x = 0;
    this.y = 0;
    this.w = m_size*dc.width;
    this.h = m_size*dc.height;

    this.wx = wx;
    this.wy = wy;
    this.wxv = wxv;
    this.wyv = wyv;
    this.m = m;
  }
  var DraggableMass = function(wx,wy,wxv,wyv,m)
  {
    var self = this;

    self.x = 0;
    self.y = 0;
    self.w = m_size*dc.width;
    self.h = m_size*dc.height;

    self.wx = wx;
    self.wy = wy;
    self.wxv = wxv;
    self.wyv = wyv;
    self.m = m;

    self.dragging = false;
    self.dragStart = function(evt)
    {
      self.dragging = true;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      self.wx = evt.doX/dc.width;
      self.wy = (dc.height-evt.doY)/dc.height;
      self.wxv = 0;
      self.wyv = 0;
    }
    self.dragFinish = function(evt)
    {
      self.dragging = false;
    }
  }
  var moveMass = function(m)
  {
    m.wx += m.wxv;
    m.wy += m.wyv;
  }
  var pDistSqr = function(a,b)
  {
    var wxv = b.wx-a.wx;
    var wyv = b.wy-a.wy;
    return (wxv*wxv)+(wyv*wyv);
  }
  var tmpP = new Particle(0,0,0,0);
  var collideParticles = function(a,b)
  {
    var xd = b.wx - a.wx;
    var yd = b.wy - a.wy;
    var dsqr = (xd*xd)+(yd*yd);
    if(dsqr > pCollideDistSqr) return;
    var d = Math.sqrt(dsqr);

    //bounce particles
    tmpP.wxv = a.wxv;
    tmpP.wyv = a.wyv;
    a.wxv = b.wxv;
    a.wyv = b.wyv;
    b.wxv = tmpP.wxv;
    b.wyv = tmpP.wyv;

    //push particles away
    if(d == 0) { a.wx += 0.001; a.wy += 0.001; return; }
    var md = (p_size-d)/2;
    var t = Math.atan2(yd,xd);
    var mx = md*Math.cos(t);
    var my = md*Math.sin(t);
    a.wx -= mx;
    a.wy -= my;
    b.wx += mx;
    b.wy += my;
  }
  var tmpM = new Mass(0,0,0,0,0);
  var collideParticleMass = function(p,m)
  {
    var xd = m.wx - p.wx;
    var yd = m.wy - p.wy;
    var dsqr = (xd*xd)+(yd*yd);
    if(dsqr > pmCollideDistSqr) return;
    var d = Math.sqrt(dsqr);

    //bounce particle/mass
    tmpP.wxv = p.wxv-m.wxv;
    tmpP.wyv = p.wyv-m.wyv;
    tmpM.wxv = tmpP.wxv*2/(1+m.m);
    tmpM.wyv = tmpP.wyv*2/(1+m.m);
    tmpP.wxv = (tmpP.wxv*(1-m.m))/(1+m.m);
    tmpP.wyv = (tmpP.wyv*(1-m.m))/(1+m.m);

    p.wxv = tmpP.wxv+m.wxv;
    p.wyv = tmpP.wyv+m.wyv;
    m.wxv = m.wxv+tmpM.wxv;
    m.wyv = m.wyv+tmpM.wyv;

    //push particle/mass away
    if(d == 0) { a.wx += 0.001; a.wy += 0.001; return; }
    var md = (((p_size+m_size)/2)-d)/2;
    var t = Math.atan2(yd,xd);
    var mx = md*Math.cos(t);
    var my = md*Math.sin(t);
    p.wx -= mx;
    p.wy -= my;
    if(m.dragging) return;
    m.wx += mx;
    m.wy += my;
  }
  var collideParticleEdge = function(p)
  {
    if(p.wx > 1-hp_size) { p.wxv = -Math.abs(p.wxv); p.wx = 1-hp_size; }
    if(p.wx < 0+hp_size) { p.wxv =  Math.abs(p.wxv); p.wx = 0+hp_size; }
    if(p.wy > 1-hp_size) { p.wyv = -Math.abs(p.wyv); p.wy = 1-hp_size; }
    if(p.wy < 0+hp_size) { p.wyv =  Math.abs(p.wyv); p.wy = 0+hp_size; }
  }
  var collideMassEdge = function(m)
  {
    if(m.wx > 1-hm_size) { m.wxv = -Math.abs(m.wxv); m.wx = 1-hm_size; }
    if(m.wx < 0+hm_size) { m.wxv =  Math.abs(m.wxv); m.wx = 0+hm_size; }
    if(m.wy > 1-hm_size) { m.wyv = -Math.abs(m.wyv); m.wy = 1-hm_size; }
    if(m.wy < 0+hm_size) { m.wyv =  Math.abs(m.wyv); m.wy = 0+hm_size; }
  }

  var gravitateMass = function(m)
  {
    m.wyv -= gravity;
  }
  var frictionMass = function(m)
  {
    m.wyv *= friction;
    m.wxv *= friction;
  }
};

