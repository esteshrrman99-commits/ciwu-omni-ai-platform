'use strict';

function createProject({
  id,
  name,
  repository=null,
  branch='main',
  status='READY'
}) {
  if (!id || !name)
    throw new Error('PROJECT_ID_NAME_REQUIRED');

  return {
    id:String(id),
    name:String(name),
    repository:
      repository ? String(repository) : null,
    branch:String(branch || 'main'),
    status:String(status || 'READY'),
    active:false
  };
}

function createState(projects=[]) {
  const map=new Map(
    projects.map(project => [
      project.id,
      {...project}
    ])
  );

  let activeId=null;

  function activate(id) {
    if (!map.has(id))
      return {
        ok:false,
        error:'PROJECT_NOT_FOUND'
      };

    for (const project of map.values())
      project.active=false;

    map.get(id).active=true;
    activeId=id;

    return {
      ok:true,
      project:{...map.get(id)}
    };
  }

  function snapshot() {
    return {
      activeId,
      projects:[
        ...map.values()
      ].map(x => ({...x}))
    };
  }

  return {
    activate,
    snapshot
  };
}

module.exports={
  createProject,
  createState
};
