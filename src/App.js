import React, { Suspense, useState, useEffect } from "react";
import Dialog from "./Dialog";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import sunTexture from "./textures/sun.jpg";
import "./styles.css";
import Header from "./components/Header/Header";
import Bottomer from "./components/Bottomer/Bottomer";
import Spotify from "./components/Spotify/Spotify";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Helmet } from "react-helmet";
import logo from "./photos/just-logo.png";

import tx1 from "./textures/1.jpg";
import tx2 from "./textures/2.jpg";
import tx3 from "./textures/3.jpg";
import tx4 from "./textures/4.jpg";
import tx5 from "./textures/5.jpg";
import tx6 from "./textures/6.jpg";

const totalPlanets = 6;

const random = (a, b) => a + Math.random() * b;
const randomInt = (a, b) => Math.floor(random(a, b));
const randomColor = () =>
  `rgb(${randomInt(80, 50)}, ${randomInt(80, 50)}, ${randomInt(80, 50)})`;

const shuffle = (a) => {
  const temp = a.slice(0);
  for (let i = temp.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [temp[i], temp[j]] = [temp[j], temp[i]];
  }
  return temp;
};

const textures = shuffle([tx1, tx2, tx3, tx4, tx5, tx6]);

export default function App() {
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [dialogData, setDialogData] = useState(null);
  const [planetData, setPlanetData] = useState("empty");
  const [onePlanetData, setOnePlanetData] = useState("empty");
  const audioRef = React.useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Spaceify";
  }, []);

  useEffect(() => {
    // Any additional logic you want to run when planetData changes
  }, [planetData]);

  useEffect(() => {
    // You can perform other actions here if needed when onePlanetData changes
  }, [onePlanetData]);

  const hideDialog = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // Add the fade-out animation class
    setIsDialogVisible(false);

    const MyComponent = () => {
      return (
        <div>
          <Helmet>
            <meta property="og:image" content={logo} />
            <meta property="og:title" content="Spaceify" />
            <title>Spaceify</title>
          </Helmet>
          {/* Rest of your component */}
        </div>
      );
    };

    // Wait for the animation to complete before actually hiding the dialog
    setTimeout(() => {
      setDialogData(null);
      setIsAnimating(true);
    }, 1000); // The timeout should match the animation duration
  };

  const handleSearch = async (spotifyLink) => {
    setIsLoading(true);
    const postData = {
      url: spotifyLink,
    };

    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      };

      const res = await fetch(
        "/api/spotify/playlist",
        options,
      );

      const json = await res.json();
      setPlanetData(json.items);
    } catch (error) {
      console.error(`Error occurred: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };
  if (planetData != "empty") {
    return (
      <>
        <Spotify onePlanetData={onePlanetData}></Spotify>
        <Header></Header>
        <Dialog
          hideDialog={hideDialog}
          dialogData={dialogData}
          className={
            isDialogVisible
              ? "dialog dialog-fade-in-up"
              : "dialog dialog-fade-out-down"
          }
        />
        <Canvas camera={{ position: [0, 20, 25], fov: 45 }}>
          <Suspense fallback={null}>
            <Sun />
            {planetData.map((planet) => (
              <Planet
                planet={planet}
                key={planet.id}
                setDialogData={setDialogData}
                setOnePlanetData={setOnePlanetData}
                isAnimating={isAnimating}
                setIsAnimating={setIsAnimating}
                setIsDialogVisible={setIsDialogVisible} // for animation
                audioRef={audioRef}
              />
            ))}
            <Lights />
            <OrbitControls />
          </Suspense>
        </Canvas>
        {isLoading && (
          <div className="loading-container">
            <CircularProgress />
          </div>
        )}
        <Bottomer handleSearch={handleSearch}></Bottomer>
      </>
    );
  } else {
    return (
      <>
        <Spotify onePlanetData="empty"></Spotify>
        <Header></Header>
        <Dialog hideDialog={hideDialog} dialogData={dialogData} />
        <Canvas camera={{ position: [0, 20, 25], fov: 45 }}>
          <Suspense fallback={null}>
            <Sun />
            <Lights />
            <OrbitControls />
          </Suspense>
        </Canvas>
        {isLoading && (
          <div className="loading-container">
            <CircularProgress />
          </div>
        )}
        <Bottomer handleSearch={handleSearch}></Bottomer>
      </>
    );
  }
}
function Sun() {
  const texture = useLoader(THREE.TextureLoader, sunTexture);
  return (
    <mesh>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
function Planet({
  planet: {
    color,
    xRadius,
    zRadius,
    size,
    speed,
    offset,
    rotationSpeed,
    textureMap,
    name,
    artists,
    is_explicit,
    surfaceArea,
    population,
    image_url,
    album,
    preview,
  },
  setDialogData,
  setOnePlanetData,
  isAnimating,
  setIsAnimating,
  setIsDialogVisible,
  planet,
  audioRef,
}) {
  const planetRef = React.useRef();
  const [time, setTime] = useState(0);
  let imageUrl;
  if (textureMap) {
    imageUrl = `data:image/png;base64,${textureMap}`;
  } else {
    imageUrl = tx1;
  }
  const texture = useLoader(THREE.TextureLoader, imageUrl); //HARDCODED TEXTURE
  useEffect(() => {
    let interval;

    if (isAnimating) {
      // Start the timer only if the animation is running
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 0.01); // Update time
      }, 10); // Adjust the interval as needed
    } else {
      // Clear the interval if the animation is not running
      clearInterval(interval);
    }

    return () => {
      if (interval) {
        clearInterval(interval); // Clear the interval on cleanup
      }
    };
  }, [isAnimating]);
  useFrame(() => {
    if (isAnimating) {
      const t = time * 0.25 * speed + offset;
      const x = xRadius * Math.sin(t);
      const z = xRadius * Math.cos(t);
      if (planetRef) {
        planetRef.current.position.x = x;
        planetRef.current.position.z = z;
        planetRef.current.rotation.y += rotationSpeed;
      }
    }
  });
  const handlePlanetClick = () => {
    setIsDialogVisible(true);
    setIsAnimating(false);
    setDialogData({
      name,
      artists,
      is_explicit,
      population,
      album,
      preview,
    });
    setOnePlanetData({ name, artists, image_url });
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (preview) {
      console.log("Playing music from URL: ", preview);
      audioRef.current = new Audio(preview);
      audioRef.current
        .play()
        .catch((e) => console.error("Error playing audio: ", e));
    } else {
      console.log("No music preview available for this planet");
    }
  };

  const hitboxSize = size * 1000000;

  if (planetRef) {
    return (
      <>
        <mesh ref={planetRef} onClick={handlePlanetClick}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial map={texture} />
          <Html distanceFactor={15}>
            <div className="annotation">{name}</div>
          </Html>
        </mesh>
        <mesh
          position={planetRef.current ? planetRef.current.position : [0, 0, 0]}
          onClick={handlePlanetClick}
          visible={false} // Make the hitbox invisible
        >
          <sphereGeometry args={[hitboxSize, 200, 200]} />
          <meshStandardMaterial opacity={0} transparent />
        </mesh>
        <Ecliptic xRadius={xRadius} zRadius={zRadius} />
      </>
    );
  }
}

function Lights() {
  return (
    <>
      <ambientLight />
      <pointLight position={[0, 0, 0]} />
    </>
  );
}

function Ecliptic({ xRadius = 1, zRadius = 1 }) {
  const points = [];
  for (let index = 0; index < 64; index++) {
    const angle = (index / 64) * 2 * Math.PI;
    const x = xRadius * Math.cos(angle);
    const z = xRadius * Math.sin(angle);
    points.push(new THREE.Vector3(x, 0, z));
  }

  points.push(points[0]);

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial attach="material" color="#393e46" linewidth={10} />
    </line>
  );
}
