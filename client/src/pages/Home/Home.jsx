import { Routes, Route } from "react-router-dom";
import styles from "./Home.module.css";
import Editor from "../../components/Editor/Editor";

const Home = () => {
  return (
    <div className={styles.home}>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/:id" element={<Editor />} />
        <Route path="/r/:id" element={<Editor />} />
      </Routes>
    </div>
  );
};

export default Home;
