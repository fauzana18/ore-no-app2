import FinanceService from '../../service/financeService'
import { saldoStore, profileStore } from '../../store/finance.js'

export default {
    data() {
		return {
            saldo: saldoStore(),
            profiles: profileStore(),
            amountNegative: false,
            loading: false,
			income: 0,
			out: 0,
            pemasukan: [],
            pengeluaran: [],
            monthly: [],
            modes: [
				{name: 'List', icon: 'pi-list', code: 1},
				{name: 'Grafik', icon: 'pi-chart-line', code: 2}
			],
            selectedMode: null,
            pieData: {},
            pieData2: {},
            pieOptions: null,
            lineData: {},
			lineOptions: null,
            ranges: [
				{ label: 'Semua', code: 1 },
				{ label: '7 Hari Terakhir', code: 2 },
				{ label: '30 Hari Terakhir', code: 3 },
				{ label: 'Bulan Ini', code: 4 },
				{ label: 'Bulan Lalu', code: 5 },
				{ label: 'Atur Sendiri', code: 6 },
			],
			range: {},
            rerender: 0,
            showLegend: false,
            lineHeight: 120,
			dateStart: null,
			dateEnd: null,
			dateDialog: false
		}
	},
	financeService: null,
    watch: {
        'saldo.in': {
			handler() {
				this.income = this.saldo.in
				this.amountNegative = this.income - this.out < 0
			}
		},
		'saldo.out': {
			handler() {
				this.out = this.saldo.out
				this.amountNegative = this.income - this.out < 0
			}
		},
        'saldo.monthly': {
            handler() {
                this.splitCategorized(this.saldo.categorized)
                this.monthlyToArray(this.saldo.monthly)
                this.initPieData()
                this.initLineData()
            }
        },
    },
    created() {
		this.financeService = new FinanceService()
	},
	async mounted() {
        const isMobile = await this.checkMobileView()
        this.lineHeight = isMobile ? 300 : 120
        if (this.isDarkTheme()) {
            this.applyDarkTheme()
        }
        else {
            this.applyLightTheme()
        }
		this.income = this.saldo.in
		this.out = this.saldo.out
		this.amountNegative = this.income - this.out < 0
        this.selectedMode = this.modes[0]
        this.range = this.ranges[0]
        this.splitCategorized(this.saldo.categorized)
        this.monthlyToArray(this.saldo.monthly)
        this.initPieData()
        this.initLineData()
	},
	methods: {
        toggleLegend() {
            this.pieOptions.plugins.legend.display = !this.pieOptions.plugins.legend.display
            this.showLegend = !this.showLegend
            this.rerender++
        },
		formatCurrency(value) {
			return value.toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})
		},
        splitCategorized(categorized) {
            let toArray = Object.keys(categorized).map(each => {
				return {
					name: each.replace('_', ' '),
					type: categorized[each].pengeluaran ? 'Pengeluaran' : 'Pemasukan',
					amount: categorized[each].pengeluaran ? categorized[each].pengeluaran : categorized[each].pemasukan
				}
			})
			this.pengeluaran = toArray.filter(each => each.type == 'Pengeluaran')
			this.pemasukan = toArray.filter(each => each.type == 'Pemasukan')
        },
        monthlyToArray(monthly) {
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
            this.monthly = Object.keys(monthly).map(each => {
                const name = each.split('_')
				return {
					name: `${monthNames[name[0]]} ${name[1]}`,
					in: monthly[each].pemasukan,
					out: monthly[each].pengeluaran
				}
			})
        },
        initPieData() {
            const color = ['#FFCE56', '#36A2EB', '#FF6384', '#fff15f', '#ff868b', '#488889', '#d8f4ff', '#a81aff', '#555e31', '#ba6d04', '#975a21', '#c6956c']
            this.pieData = {
                labels: this.pengeluaran.map(each => each.name),
				datasets: [
					{
						data: this.pengeluaran.map(each => each.amount),
						backgroundColor: color
					}
				]
            }

            this.pieData2 = {
                labels: this.pemasukan.map(each => each.name),
				datasets: [
					{
						data: this.pemasukan.map(each => each.amount),
						backgroundColor: color
					}
				]
            }
        },
        initLineData() {
            this.lineData = {
                labels: this.monthly.map(each => each.name),
                datasets: [
                    {
                        label: 'Pengeluaran',
                        data: this.monthly.map(each => each.out),
                        fill: false,
                        backgroundColor: '#2f4860',
                        borderColor: '#2f4860',
                        tension: 0.4
                    },
                    {
                        label: 'Pemasukan',
                        data: this.monthly.map(each => each.in),
                        fill: false,
                        backgroundColor: '#00bb7e',
                        borderColor: '#00bb7e',
                        tension: 0.4
                    }
                ]
            }
        },
		async selectRange() {
			if(this.range.code == 6) {
				this.dateStart = null
				this.dateEnd = null
				this.dateDialog = true
				return
			}

			let range = this.handleRange()
			await this.getSaldo(range)
		},
		reselect() {
			if(!this.dateStart && !this.dateEnd) this.range = this.ranges[0]
		},
		async searchDate() {
			this.dateDialog = false
			if(!this.dateStart && !this.dateEnd) return
			let range = this.handleRange()
			await this.getSaldo(range)
		},
		handleRange() {
			const date = new Date(), y = date.getFullYear(), m = date.getMonth()
			let range = {}, ny, nm
			switch (this.range.code) {
				case 1:
					range = undefined
					break
				case 2:
					date.setDate(date.getDate() - 7)
					date.setHours(0, 0, 0, 0)
					range = { gte: date }
					break
				case 3:
					date.setDate(date.getDate() - 30)
					date.setHours(0, 0, 0, 0)
					range = { gte: date }
					break
				case 4:
					nm = m + 1 == 12 ? 0 : m + 1
					ny = m + 1 == 12 ? y + 1 : y
					range = { gte: new Date(y, m, 0), lte: new Date(ny, nm, 0) }
					break
				case 5:
					nm = m - 1 < 0 ? 12 : m - 1
					ny = m - 1 < 0 ? y - 1 : y
					range = { gte: new Date(ny, nm, 0), lte: new Date(y, m, 0) }
					break
				case 6:
					const start = new Date(this.dateStart)
					start.setDate(start.getDate() - 1)
					if(start) range.gte = start
					if(this.dateEnd) range.lte = this.dateEnd
					break
			}

			return range
		},
		async getSaldo(range) {
			const res = await this.financeService.getSaldo(this.profiles.list[this.profiles.selected].id, range)
			this.out = res.data.pengeluaran
			this.income = res.data.pemasukan
			this.amountNegative = this.income - this.out < 0
			this.splitCategorized(res.data.categorized)
			this.monthlyToArray(res.data.monthly)
			this.initPieData()
			this.initLineData()
		},
        isDarkTheme() {
            return localStorage.getItem('dark') == 'true'
        },
		applyLightTheme() {
			this.lineOptions = {
				plugins: {
					legend: {
						labels: {
							color: '#495057'
						}
					}
				},
				scales: {
					x: {
						ticks: {
							color: '#495057'
						},
						grid: {
							color:  '#ebedef',
						}
					},
					y: {
						ticks: {
							color: '#495057'
						},
						grid: {
							color:  '#ebedef',
						}
					},
				}
			}

			this.pieOptions = {
				plugins: {
					legend: {
						labels: {
							color: '#495057'
						}
					},
                    position: 'right',
                    display: false
				}
			}

		},
		applyDarkTheme() {
			this.lineOptions = {
				plugins: {
					legend: {
						labels: {
							color: '#ebedef'
						}
					}
				},
				scales: {
					x: {
						ticks: {
							color: '#ebedef'
						},
						grid: {
							color:  'rgba(160, 167, 181, .3)',
						}
					},
					y: {
						ticks: {
							color: '#ebedef'
						},
						grid: {
							color:  'rgba(160, 167, 181, .3)',
						}
					},
				}
			}

			this.pieOptions = {
				plugins: {
					legend: {
						labels: {
							color: '#ebedef'
						},
                        position: 'right',
                        display: false
					}
				}
			}
		},
        checkMobileView(){
            return new Promise(resolve=>{
                if(window.innerWidth < 768 || (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
                    resolve(true)
                } 
                
                resolve(false)
            })
        }
	}
}