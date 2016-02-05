var GamePlayScene = function(game, stage)
{
  var self = this;
  var dc = stage.drawCanv;

  var balloon;
  var particles;
  var n_particles;
  var p_size;
  var p_vel;
  var m_size;
  var m_vel;
  var m_m;
  var hp_size;
  var hm_size;
  var pCollideDistSqr;
  var pmCollideDistSqr;

  var dragger;

  self.ready = function()
  {
    dragger = new Dragger({source:stage.dispCanv.canvas});

    particles = [];
    n_particles = 1000;
    p_size = 0.02;
    p_vel = 0.005;
    m_size = 0.2;
    m_vel = 0.005;
    m_m = 1;
    hp_size = p_size/2;
    hm_size = m_size/2;
    pCollideDistSqr = p_size; pCollideDistSqr *= pCollideDistSqr;
    pmCollideDistSqr = (p_size+m_size)/2; pmCollideDistSqr *= pmCollideDistSqr;

    for(var i = 0; i < n_particles; i++)
      particles.push(new Particle(Math.random(),Math.random(),(Math.random()*p_vel*2)-p_vel,(Math.random()*p_vel*2)-p_vel));
    balloon = new DraggableMass(Math.random(),Math.random(),(Math.random()*m_vel*2)-m_vel,(Math.random()*m_vel*2)-m_vel,m_m);

    dragger.register(balloon);
  };

  self.tick = function()
  {
    dragger.flush();

    //movement
    for(var i = 0; i < n_particles; i++)
      moveMass(particles[i]);
    moveMass(balloon);

    //gravity
    for(var i = 0; i < n_particles; i++)
      particles[i].wyv += 0.0001;
    balloon.wyv += 0.0001;

    //collision - bounce
    for(var i = 0; i < n_particles; i++)
    {
      for(var j = i+1; j < n_particles; j++)
      {
        collideParticles(particles[i],particles[j]);
      }
    }
    for(var i = 0; i < n_particles; i++)
    {
      collideParticleMass(particles[i],balloon);
    }

    //edge detection
    var p;
    for(var i = 0; i < n_particles; i++)
      collideParticleEdge(particles[i]);
    collideMassEdge(balloon);
  };

  self.draw = function()
  {
    var w = dc.width;
    var h = dc.height;
    var pw = p_size * w;
    var ph = p_size * h;
    var hpw = pw/2;
    var hph = ph/2;
    dc.context.fillStyle = "#000000";
    for(var i = 0; i < n_particles; i++)
      dc.context.fillRect(particles[i].wx*w-hpw,particles[i].wy*h-hph,pw,ph);
    //dc.context.fillStyle = "#FF0000";
    dc.context.fillStyle = "rgba(255,0,0,0.5)";
    balloon.x = balloon.wx*w-balloon.w/2;
    balloon.y = balloon.wy*h-balloon.h/2;
    dc.context.fillRect(balloon.x,balloon.y,balloon.w,balloon.h);
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

    self.dragStart = function(evt)
    {
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      self.wx = evt.doX/dc.width;
      self.wy = evt.doY/dc.height;
      self.wxv = 0;
      self.wyv = 0;
    }
    self.dragFinish = function(evt)
    {

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
    if(pDistSqr(a,b) > pCollideDistSqr) return;

    //bounce particles
    tmpP.wxv = a.wxv;
    tmpP.wyv = a.wyv;
    a.wxv = b.wxv;
    a.wyv = b.wyv;
    b.wxv = tmpP.wxv;
    b.wyv = tmpP.wyv;

    //push particles away
    tmpP.wx = a.wx+((b.wx-a.wx)/2);
    tmpP.wy = a.wy+((b.wy-a.wy)/2);
    if(a.wx < b.wx)
    {
      a.wx = tmpP.wx-hp_size;
      b.wx = tmpP.wx+hp_size;
    }
    else
    {
      a.wx = tmpP.wx+hp_size;
      b.wx = tmpP.wx-hp_size;
    }
    if(a.wy < b.wy)
    {
      a.wy = tmpP.wy-hp_size;
      b.wy = tmpP.wy+hp_size;
    }
    else
    {
      a.wy = tmpP.wy+hp_size;
      b.wy = tmpP.wy-hp_size;
    }
  }
  var tmpM = new Mass(0,0,0,0,0);
  var collideParticleMass = function(p,m)
  {
    if(pDistSqr(p,m) > pmCollideDistSqr) return;

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
    if(p.wx < m.wx)
    {
      tmpP.wx = p.wx+((m.wx-p.wx)*(p_size/m_size));
      p.wx = tmpP.wx-hp_size;
      m.wx = tmpP.wx+hm_size;
    }
    else
    {
      tmpP.wx = m.wx+((p.wx-m.wx)*(p_size/m_size));
      p.wx = tmpP.wx+hp_size;
      m.wx = tmpP.wx-hm_size;
    }
    if(p.wy < m.wy)
    {
      tmpP.wy = p.wy+((m.wy-p.wy)*(p_size/m_size));
      p.wy = tmpP.wy-hp_size;
      m.wy = tmpP.wy+hm_size;
    }
    else
    {
      tmpP.wy = m.wy+((p.wy-m.wy)*(p_size/m_size));
      p.wy = tmpP.wy+hp_size;
      m.wy = tmpP.wy-hm_size;
    }
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

  var Balloon = function()
  {
    var self = this;

  }
};

