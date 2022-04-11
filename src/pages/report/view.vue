<template>
	<div class="grid">
		<div class="col-12">
			<div class="card">
				<div class="grid justify-content-between">
                    <h5>Laporan Keuangan</h5>
                    <SelectButton v-model="selectedMode" :options="modes" optionLabel="name">
                        <template #option="slotProps">
                            <div>
                                <i class="pi" :class="slotProps.option.icon"></i>
                            </div>
                        </template>
                    </SelectButton>
                </div>
                <div class="col-12 align-items-center justify-content-center mt-2">
                    <div class="grid info-saldo">
                        <p class="line-height-3 m-0">Total Pengeluaran</p>
                        <p class="line-height-3 ml-4">{{formatCurrency(saldo.out)}}</p>
                    </div>
                    <Divider></Divider>
                    <div class="grid info-saldo">
                        <p class="line-height-3 m-0 text-green-500">Total Pemasukan</p>
                        <p class="line-height-3 m-0 text-green-500 ml-4">{{formatCurrency(saldo.in)}}</p>
                    </div>
                    <Divider></Divider>
                    <div class="grid info-saldo">
                        <p class="line-height-3 m-0">Saldo</p>
                        <p class="line-height-3 m-0 ml-4" :class="amountNegative ? 'text-red' : 'text-green-500'">{{formatCurrency(saldo.in - saldo.out)}}</p>
                    </div>
                    <Divider></Divider>
                </div>
                <Dropdown style="width: 100%; text-align: center;" v-model="range"  :options="ranges" optionLabel="label" placeholder="Periode" class="mr-2 mt-2 mb-3 md:mt-0"/>
				<div v-if="selectedMode && selectedMode.code == 1" class="grid">
                    <div class="col-12 xl:col-6">
                        <DataTable :value="pengeluaran" responsiveLayout="scroll" :loading="loading">
                            <template #header>
                                Top Kategori Pengeluaran
                            </template>
                            <template #empty>
                                Data kosong.
                            </template>
                            <template #loading>
                                Memuat data. Mohon tunggu.
                            </template>
                            <Column field="name" header="Kategori"></Column>
                            <Column field="amount" header="Jumlah" style="width:20%">
                                <template #body="slotProps">
                                    <span>{{formatCurrency(slotProps.data.amount)}}</span>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                    <div class="col-12 xl:col-6">
                        <DataTable :value="pemasukan" responsiveLayout="scroll" :loading="loading">
                            <template #header>
                                Top Kategori Pemasukan
                            </template>
                            <template #empty>
                                Data kosong.
                            </template>
                            <template #loading>
                                Memuat data. Mohon tunggu.
                            </template>
                            <Column field="name" header="Kategori"></Column>
                            <Column field="amount" header="Jumlah" style="width:20%">
                                <template #body="slotProps">
                                    <span>{{formatCurrency(slotProps.data.amount)}}</span>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>

                <div v-else class="grid mt-3">
                    <div class="col-12 xl:col-6">
                        <div class="grid justify-content-between align-items-center">
                            <h5 class="align-self-start m-0">Grafik Kategori Pengeluaran</h5>
                            <i class="pi toggle-left" :class="showLegend ? 'pi-filter' : 'pi-filter-slash'" style="cursor: pointer;" @click="toggleLegend"></i>
                        </div>
				        <Chart v-if="pengeluaran.length" type="pie" :data="pieData" :options="pieOptions" :key="'pie1' + rerender" />
                    </div>
                    <div class="col-12 xl:col-6">
                        <div class="grid justify-content-between align-items-center">
                            <h5 class="align-self-start m-0">Grafik Kategori Pemasukan</h5>
                            <i class="pi toggle-right" :class="showLegend ? 'pi-filter' : 'pi-filter-slash'" style="cursor: pointer;" @click="toggleLegend"></i>
                        </div>
				        <Chart v-if="pemasukan.length" type="pie" :data="pieData2" :options="pieOptions" :key="'pie2' + rerender" />
                    </div>
                </div>

                <div v-if="selectedMode && selectedMode.code == 1" class="col-12 align-items-center justify-content-center">
                    <DataTable :value="monthly" responsiveLayout="stack" :loading="loading">
                        <template #header>
                            Laporan Bulanan
                        </template>
                        <template #empty>
                            Data kosong.
                        </template>
                        <template #loading>
                            Memuat data. Mohon tunggu.
                        </template>
                        <Column field="name" header="Bulan"></Column>
                        <Column field="in" header="Pengeluaran">
                            <template #body="slotProps">
                                <span>{{formatCurrency(slotProps.data.out)}}</span>
                            </template>
                        </Column>
                        <Column field="out" header="Pemasukan">
                            <template #body="slotProps">
                                <span>{{formatCurrency(slotProps.data.in)}}</span>
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <div v-else class="col-12 align-items-center justify-content-center">
                    <h5>Grafik Bulanan</h5>
                    <Chart v-if="pemasukan.length" type="line" :data="lineData" :options="lineOptions" />
                </div>
			</div>
		</div>
	</div>
</template>

<script src="./index.js"></script>

<style scoped lang="scss" src="./style.scss"></style>