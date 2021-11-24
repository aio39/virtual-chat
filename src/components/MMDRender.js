import { Box } from '@chakra-ui/layout';
import React, { useEffect } from 'react';
import * as THREE from 'three';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect';
// import Stats from 'three/examples/jsm/libs/stats';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader';

const defaultBones = {
  miku: {
    head_num: 17,
    left_eye_num: 98,
    right_eye_num: 99,
    right_arm_num: 20,
    left_arm_num: 60,
  },
  kizunaai: {
    head_num: 8,
    left_eye_num: 86,
    right_eye_num: 88,
    right_arm_num: 99,
    left_arm_num: 99,
  },
};

function onProgress(xhr) {
  if (xhr.lengthComputable) {
    const percentComplete = (xhr.loaded / xhr.total) * 100;
    console.log(Math.round(percentComplete, 2) + '% downloaded');
  }
}

const modelUrl = (model) => {
  return `${
    process.env.REACT_APP_URL ?? ''
  }/public/models/${model}/${model}.pmx`;
};

const MMDContainer = ({ name, model }) => {
  useEffect(() => {
    let container, stats, helper;
    let mesh, camera, scene, renderer, effect;
    let head, left_eye, right_eye, left_arm, right_arm;
    const ANGLE_CONST = 3.1415926 / 180;
    const clock = new THREE.Clock();

    const aspect = 1;
    const width = parseInt(window.innerWidth / 3);
    const height = parseInt(window.innerWidth / 3);
    // const height = parseInt(window.innerHeight / 3);

    function frame() {
      helper.update(clock.getDelta());
      effect.render(scene, camera);
      requestAnimationFrame(frame);
    }

    setTimeout(function () {
      requestAnimationFrame(() => {
        animate({ euler: [0, 0, 0], eye: [0, 0] });
        // frame();
      });
    }, 2000);

    init();

    function init() {
      const parent = document.getElementById('mmd' + name);
      parent.innerHTML = ''; // 리액트 새로고침될때 초기화 시키기
      camera = new THREE.PerspectiveCamera(20, aspect, 1, 100);
      camera.position.set(0, 0, 16); // x y z 축  , == position.z = 16

      // scene
      console.log(modelUrl(model));
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);

      const ambient = new THREE.AmbientLight(0x666666);
      scene.add(ambient);

      const directionalLight = new THREE.DirectionalLight(0x887766);
      directionalLight.position.set(-1, 1, 1).normalize();
      scene.add(directionalLight);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height); // 랜더링될 크기 , 3번쨰 옵션  false주면 100% 크기에 해상도만 바뀜
      parent.appendChild(renderer.domElement);

      effect = new OutlineEffect(renderer);

      // // STATS

      // stats = new Stats();
      // parent.appendChild(stats.dom);

      const mmdLoader = new MMDLoader();
      helper = new MMDAnimationHelper({ afterglow: 0.0 });

      const filePath = modelUrl(model);

      mmdLoader.load(
        modelUrl(model),
        function (object) {
          // geometry + material => mesh
          mesh = object;
          mesh.position.y = -18;

          // mesh.rotation.y = 0.1;

          scene.add(mesh); // scene에다가 mesh 넣어주기

          helper.add(mesh, { physics: true });

          const ikHelper = helper.objects.get(mesh).ikSolver.createHelper();
          ikHelper.visible = true;
          scene.add(ikHelper);

          const physicsHelper = helper.objects.get(mesh).physics.createHelper();
          physicsHelper.visible = false;
          scene.add(physicsHelper);

          const bones = physicsHelper.physics.mesh.skeleton.bones;
          const {
            head_num,
            left_eye_num,
            right_eye_num,
            right_arm_num,
            left_arm_num,
          } = defaultBones[model];

          head = bones[head_num];
          left_eye = bones[left_eye_num];
          right_eye = bones[right_eye_num];
          right_arm = bones[right_arm_num];
          left_arm = bones[left_arm_num];

          right_arm.rotation.y = -30;
          right_arm.rotation.x = 10;

          // left_arm.rotation.y = +30;
          // left_arm.rotation.x = 10;
        },
        onProgress,
        null
      );
      window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
      console.log('resize window');
      // camera.aspect = aspect;
      camera.updateProjectionMatrix();
      effect.setSize(width, height);
    }

    function animate(result) {
      // stats.begin();
      render(result);
      // stats.end();
    }
    window.myData.animates[name] = animate;

    function render(result) {
      const euler = result.euler;
      const eye_euler = result.eye;
      const mouth = result.mouth;
      const blink = result.blink;
      if (head) {
        head.rotation.x = Math.round(euler[0]) * ANGLE_CONST;
        head.rotation.y = Math.round(euler[1]) * ANGLE_CONST;
        head.rotation.z = Math.round(euler[2]) * ANGLE_CONST;
      }

      if (left_eye) {
        left_eye.rotation.y = eye_euler[0];
        left_eye.rotation.x = eye_euler[1];
      }
      if (right_eye) {
        right_eye.rotation.y = eye_euler[0];
        right_eye.rotation.x = eye_euler[1];
      }

      let mouth_index, eye_index;

      if (mouth > 0.6) mouth_index = 9;
      else if (mouth > 0.4) mouth_index = 12;
      else if (mouth > 0.2) mouth_index = 11;

      if (blink) {
        if (blink[0] < 0.1 && blink[1] < 0.1) eye_index = 1;
        else if (blink[0] < 0.1) eye_index = 4;
        else if (blink[1] < 0.1) eye_index = 5;
      }

      if (mouth_index) {
        mesh.morphTargetInfluences[mouth_index] = 1;
      }

      if (eye_index) {
        mesh.morphTargetInfluences[eye_index] = 1;
      }

      helper.update(clock.getDelta());
      effect.render(scene, camera);

      if (mouth_index) {
        mesh.morphTargetInfluences[mouth_index] = 0;
      }

      if (eye_index) {
        mesh.morphTargetInfluences[eye_index] = 0;
      }
    }

    function renderByGui(data) {
      camera.position.x = data.cameraX;
      camera.position.z = data.cameraZ;
      camera.position.y = data.cameraY;

      mesh.rotation.x = data.meshRotateX;
      mesh.rotation.z = data.meshRotateZ;
      mesh.rotation.y = data.meshRotateY;

      helper.update(clock.getDelta());
      effect.render(scene, camera);
    }
    window.myData.renderByGui = renderByGui;
  }, [model, name]);

  return <div></div>;
};

const MMDRender = ({ name, model }) => {
  return (
    <Box position="relative">
      <Box id={'mmd' + name}>
        <MMDContainer name={name} model={model} />
      </Box>
      <Box position="absolute" bottom="0" fontSize="1rem">
        {name}
      </Box>
    </Box>
  );
};

export default MMDRender;
