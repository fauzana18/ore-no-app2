import workoutService from '../../service/workoutService'

export default {
    data() {
		return {
			loading: true,
			rerender: 0,
			expandedRowGroups: null,
			workouts: [],
			editDialog: false,
			createDialog: false,
			selected: null,
			reps: 0,
			set: 'set1',
			submitting: false,
			workset: null,
			worksets: [
				{workset: 1, label: 'Minggu 1, Hari ke 1 dan 3'},
				{workset: 2, label: 'Minggu 1, Hari ke 2'},
				{workset: 3, label: 'Minggu 2, Hari ke 1 dan 3'},
				{workset: 4, label: 'Minggu 2, Hari ke 2'},
			],
			createDisabled: false
		}
	},
	workoutService: null,
    watch: {
    },
    created() {
		this.workoutService = new workoutService()
	},
	async mounted() {
		await this.getList()
	},
	methods: {
		dateHandler(date) {
			const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
			const d = new Date(date)
			const dateNow = new Date()
			const dateString = d.toLocaleDateString('id-ID', options)
			const dateNowString = dateNow.toLocaleDateString('id-ID', options)
			const res = dateNowString == dateString ? `Hari ini, ${dateString.split(', ')[1]}` : dateString
			return res
		},
		onRowGroupExpand(e) {
			this.expandedRowGroups.push(e.data)
			if(this.expandedRowGroups.length > 3) this.expandedRowGroups.shift()
		},
		async reload() {
			this.rerender++
			await this.getList()
		},
		async getList() {
			this.loading = true
			this.createDisabled = false
            const list = await this.workoutService.getWorkout()
            this.workouts = list.data.result
			this.workouts.forEach(each => {
				const now = new Date()
				const date =  new Date(each.date)
				date.setHours(0, 0, 0, 0)
				now.setHours(0, 0, 0, 0)
				each.date = date.toJSON()
				if(date.getTime() == now.getTime()) this.createDisabled = true
			})
			this.loading = false
        },
		openCreateDialog() {
			this.workset = null
			this.createDialog = true
		},
		async createNew() {
			let stat, message, summary
			this.submitting = true

			try {
				const res = await this.workoutService.createWorkout(this.workset)

				if(res.status == 200) {
					stat = 'success'
					message = res.data.message
					summary = 'Sukses'
				}
				else {
					stat = 'error'
					message = res.data.message
					summary = 'Gagal'
				}
			}
			catch(err) {
				this.submitStatus = 'error'
				this.submitMessage = err.response ? err.response.data.message : 'Data gagal dibuat.'
			}

			this.createDialog = false
			this.$toast.add({severity: stat, summary, detail: message, life: 1000})
			this.submitting = false
			if(stat == 'success') await this.getList()
		},
		editReps(id, data, set) {
			this.selected = id
			this.reps = data
			this.set = set
			this.editDialog = true
		},
		async updateReps() {
			let stat, message, summary
			this.submitting = true
			const body = {
				[this.set]: this.reps
			}

			try {
				const res = await this.workoutService.updateWorkout(body, this.selected)

				if(res.status == 200) {
					stat = 'success'
					message = res.data.message
					summary = 'Sukses'
				}
				else {
					stat = 'error'
					message = res.data.message
					summary = 'Gagal'
				}
			}
			catch(err) {
				this.submitStatus = 'error'
				this.submitMessage = err.response ? err.response.data.message : 'Data gagal dibuat.'
			}

			this.editDialog = false
			this.$toast.add({severity: stat, summary, detail: message, life: 1000})
			this.submitting = false
			if(stat == 'success') await this.getList()
		},
		confirmDelete(e, date) {
			const d = new Date(date)
			const filtered = this.workouts.filter(each => new Date(each.date).getTime() == d.getTime())
			const ids = filtered.map(each => each.id)
			this.$confirm.require({
                target: e.currentTarget,
                message: `Apakah anda yakin ingin menghapus catatan di tanggal ini?`,
                icon: 'pi pi-exclamation-triangle',
                accept: async () => {
					await this.deleteWorkout(ids)
                },
                reject: () => {
                    this.$confirm.close()
                }
            })
		},
		async deleteWorkout(ids) {
			let stat, message, summary
			this.submitting = true
			
			try {
				const res = await this.workoutService.deleteWorkout({ids})

				if(res.status == 200) {
					stat = 'success'
					message = res.data.message
					summary = 'Sukses'
				}
				else {
					stat = 'error'
					message = res.data.message
					summary = 'Gagal'
				}
			}
			catch(err) {
				stat = 'error'
				message = err.response ? err.response.data.message : 'Data gagal dihapus.'
				summary = 'Gagal'
			}
			
			this.$toast.add({severity: stat, summary, detail: message, life: 1000})
			this.submitting = false
			if(stat == 'success') await this.getList()
		}
	}
}