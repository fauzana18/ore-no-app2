import FinanceService from '../../service/FinanceService'
import { saldoStore, profileStore } from '../../store/finance.js'

export default {
    data() {
		return {
            saldo: saldoStore(),
            profiles: profileStore(),
            amountNegative: false,
            loading: false,
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
            lineHeight: 120
		}
	},
	financeService: null,
    watch: {
        'saldo.in': {
			handler() {
				this.amountNegative = this.saldo.in - this.saldo.out < 0
			}
		},
		'saldo.out': {
			handler() {
				this.amountNegative = this.saldo.in - this.saldo.out < 0
			}
		},
        'saldo.monthly': {
            handler() {
                this.splitCategorized()
                this.monthlyToArray()
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
        this.selectedMode = this.modes[0]
        this.range = this.ranges[0]
        this.splitCategorized()
        this.monthlyToArray()
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
        splitCategorized() {
            let toArray = Object.keys(this.saldo.categorized).map(each => {
				return {
					name: each.replace('_', ' '),
					type: this.saldo.categorized[each].pengeluaran ? 'Pengeluaran' : 'Pemasukan',
					amount: this.saldo.categorized[each].pengeluaran ? this.saldo.categorized[each].pengeluaran : this.saldo.categorized[each].pemasukan
				}
			})
			this.pengeluaran = toArray.filter(each => each.type == 'Pengeluaran')
			this.pemasukan = toArray.filter(each => each.type == 'Pemasukan')
        },
        monthlyToArray() {
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
            this.monthly = Object.keys(this.saldo.monthly).map(each => {
                const name = each.split('_')
				return {
					name: `${monthNames[name[0]]} ${name[1]}`,
					in: this.saldo.monthly[each].pemasukan,
					out: this.saldo.monthly[each].pengeluaran
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