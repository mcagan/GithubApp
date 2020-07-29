import React, { useState } from "react";
import "./GithubApp.scss";
import MyPieChart from "./MyPieChart";
import Button from "@material-ui/core/Button";
import Avatar from "./Avatar";

const GithubApp = () => {
  const [username, setUsername] = useState("");
  const [languages, setLanguages] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [errormsg, setErrormsg] = useState("");
  const [userfullname, setUserfullname] = useState("");
  const [avatarsrc, setAvatarsrc] = useState("");
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [languageObject, setLanguageObject] = useState({});

  const myHeaders = new Headers();
  const authHeader =
    "Basic " +
    btoa(
      process.env.REACT_APP_GITHUB_CLIENT_ID +
        ":" +
        process.env.REACT_APP_GITHUB_CLIENT_SECRET
    );
  myHeaders.append("Authorization", authHeader);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const handleChange = (event) => {
    setUsername(event.target.value);
  };

  const fetchUser = async () => {
    setFetching(true);
    const resp = await fetch(
      `https://api.github.com/users/${username}`,
      requestOptions
    );
    const user = await resp.json();
    if (user) {
      setUserfullname(user.name);
      setAvatarsrc(user.avatar_url);
      setFollowers(user.followers);
      setFollowing(user.following);
      setErrormsg("");
    } else {
      setErrormsg("Not a valid user");
    }

    fetchUserdetails();
    setFetching(false);
  };

  const fetchUserdetails = async () => {
    setFetching(true);
    const resp = await fetch(
      `https://api.github.com/users/${username}/repos`,
      requestOptions
    );
    const userRepositories = await resp.json();

    if (userRepositories && userRepositories.length > 0) {
      const getRepoLang = async (name) => {
        const langResp = await fetch(
          `https://api.github.com/repos/${username}/${name}/languages`,
          requestOptions
        );
        const repoLanguages = await langResp.json();
        for (let lang in repoLanguages) {
          if (lang in languageObject) {
            const newObject = languageObject;
            newObject[lang] += 1;
            setLanguageObject(newObject);
          } else {
            const newObject = languageObject;
            newObject[lang] = 1;
            setLanguageObject(newObject);
          }
        }
      };
      userRepositories.forEach((repo) => {
        if (repo.languages_url) {
          getRepoLang(repo.name).then(() => {
            const l = [];
            l.push(["Languages", "Count"]);
            setLanguages([]);
            for (let key in languageObject) {
              l.push([key, languageObject[key]]);
            }
            setLanguages(l);
          });
        }
      });
    } else {
      setErrormsg("Not a valid user");
    }
    setFetching(false);
  };

  return (
    <div className="container">
      <h3>What language does the user code in?</h3>
      <p>(based on user's contributions to public Github repositories)</p>
      <input
        type="text"
        placeholder="Enter User's Github username"
        value={username}
        onChange={handleChange}
      />
      <Button variant="contained" color="primary" onClick={fetchUser}>
        Fetch
      </Button>
      <div>{errormsg}</div>
      <div>
        {languages.length > 0 && !fetching && (
          <div>
            <div>
              {avatarsrc && <Avatar src={avatarsrc} />}
              {userfullname && (
                <span>
                  <br />
                  {userfullname}
                </span>
              )}
              {followers && <p>Followers: {followers}</p>}
              {following && <p>Following {following}</p>}
            </div>
            <MyPieChart languages={languages} userfullname={userfullname} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GithubApp;
