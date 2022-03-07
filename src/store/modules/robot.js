import { getSiteIsUsing } from "@/api/setting/site";
import Cookies from "js-cookie";

const state = {
  stationId: Cookies.get("stationId") || "",
  stationName: Cookies.get("stationName") || ""
};

const mutations = {
  SET_STATION: (state, data) => {
    state.stationId = data.stationId;
    state.stationName = data.stationName;
    Cookies.set("stationId", data.stationId);
    Cookies.set("stationName", data.stationName);
  }
};

const actions = {
  loadSiteIsUsing({ commit }, data) {
    return new Promise((resolve, reject) => {
      getSiteIsUsing()
        .then(res => {
          commit("SET_STATION", res.data[0]);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
