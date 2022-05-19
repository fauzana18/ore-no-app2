import axios from "axios"

export default class workoutService {
    getWorkout() {
        return axios.get(`${process.env.VUE_APP_BASE_URL}/workout/workingout`)
    }

    createWorkout(body) {
        return axios.post(`${process.env.VUE_APP_BASE_URL}/workout/workingout`, body)
    }

    updateWorkout(body, id) {
        return axios.patch(`${process.env.VUE_APP_BASE_URL}/workout/workingout/${id}`, body)
    }

    deleteWorkout(body) {
        return axios.post(`${process.env.VUE_APP_BASE_URL}/workout/deleteoneday`, body)
    }
}