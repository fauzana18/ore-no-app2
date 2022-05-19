import FinanceService from '../../service/FinanceService'
import { saldoStore, profileStore } from '../../store/finance.js'

export default {
	data() {
		return {
			transactions: [],
			lineData: {},
			lineOptions: null,
            saldo: saldoStore(),
            profiles: profileStore(),
            amountNegative: false,
            loading: false,
            showMonth: 6,
			lineHeight: 120,
			saldoAll: {
				amount: 0,
				negative: false
			}
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
                this.initData()
            }
        },
        'profiles.selected': {
			async handler() {
				await this.getList()
			}
		},
    },
    created() {
		this.financeService = new FinanceService()
	},
	async mounted() {
		const saldoAll = await this.financeService.getSaldoAll()
		this.saldoAll.amount = saldoAll.data.pemasukan - saldoAll.data.pengeluaran
		this.saldoAll.negative = saldoAll.data.pemasukan - saldoAll.data.pengeluaran < 0
        this.initData()
		const isMobile = await this.checkMobileView()
        this.lineHeight = isMobile ? 300 : 120

		if (this.isDarkTheme()) {
            this.applyDarkTheme()
        }
        else {
            this.applyLightTheme()
        }
        await this.getList()
	},
	beforeUnmount() {
    },
	methods: {
		formatCurrency(value) {
			return value.toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})
		},
        dateHandler(date) {
			const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
			const d = new Date(date)
			const dateNow = new Date()
			const dateString = d.toLocaleDateString('id-ID', options)
			const dateNowString = dateNow.toLocaleDateString('id-ID', options)
			const res = dateNowString == dateString ? `Hari ini, ${dateString.split(', ')[1]}` : dateString
			return res
		},
        initData() {
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
            let months = [], data = { out: [], in: []}
            
            for(let i = this.showMonth - 1; i >= 0; i--) {
                const date = new Date()
                date.setDate(1)
                date.setMonth(date.getMonth() - i)
                const month = date.getMonth()
                const year = date.getFullYear()
                const selectedDate = `${month}_${year}`
                const selected = this.saldo.monthly[selectedDate]
                if(selected) {
                    data.out.push(selected.pengeluaran)
                    data.in.push(selected.pemasukan)
                }
                const monthLabels = `${monthNames[month]} ${year}`
                months.push(monthLabels)
            }

            this.lineData = {
                labels: months,
                datasets: [
                    {
                        label: 'Pengeluaran',
                        data: data.out,
                        fill: false,
                        backgroundColor: '#2f4860',
                        borderColor: '#2f4860',
                        tension: 0.4
                    },
                    {
                        label: 'Pemasukan',
                        data: data.in,
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
		},
        async getList() {
			this.loading = true
            const params = {
                limit: 5,
                offset: 0,
                order: ['created', 'DESC'],
			    profile_id: this.profiles.list[this.profiles.selected] ? this.profiles.list[this.profiles.selected].id : 1
            }

            const list = await this.financeService.getTransactionList(params)
            this.transactions = list.data.result
			this.loading = false
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