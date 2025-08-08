<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";

    let docNo = $state('');
    let result = $state('');

    // 当 docNo 改变时执行
    $effect(() => {
        if (docNo.length >= 5) {
            queryDocType(docNo);
        } else {
            result = '';
        }
    });

    const typeMap = [
        { prefix: 'YDDBSQ', type: '调拔申请单-跨组织' },
        { prefix: 'JLDBSQ', type: '调拔申请单-借料' },
        { prefix: 'DLDBSQ', type: '调拔申请单-呆料' },
        { prefix: 'YPDBSQ', type: '调拔申请单-样品' },
        { prefix: '-ZK', type: '直接调拨单' },
        { prefix: 'FBDC', type: '分步式调出单' },
        { prefix: 'FBDR', type: '分步式调入单' },
        { prefix: 'CGSQ', type: '采购申请单' },
        { prefix: 'CGSL', type: '收料通知单' },
        { prefix: '-PO', type: '采购订单' },
        { prefix: '-PBR', type: '付款申请单' },
        { prefix: '-IN', type: '采购入库单' },
        { prefix: '-RSTO', type: '采购退料单' },
        // SZ-SQ250605023-S
        { prefix: /^-SQ\d{9}-S$/, type: '销售报价子单' },
        { prefix: '-SQ', type: '销售报价单' },
        // SZ-SO250728255_V001
        { prefix: /^-SO\d{9}_V\d{3}$/, type: '销售订单新变更单' },
        { prefix: '-SO', type: '销售订单' },
        { prefix: '-SB', type: '销售订单-备货' },
        { prefix: '-STOA', type: '发货通知单' },
        { prefix: '-OSTO', type: '销售出库单' },
        { prefix: '-QTTO', type: '其他出库单' },
        { prefix: '-OSTI', type: '其他入库单' },
        { prefix: '-SR', type: '销售退货单' },
        { prefix: 'THTZD', type: '退货通知单' },
        // SZ-STC25070001 盘盈单
        { prefix: /^-STC\d{8}$/, type: '盘盈单' },
        // SZ-STC2507000001 盘亏单
        { prefix: '-STC', type: '盘亏单' },
        { prefix: 'HD', type: '客户拜访' },
        { prefix: '-XZKH', type: '客户建档单-新增' },
        { prefix: 'KHJDBG', type: '客户建档单-变更' },
        { prefix: 'HBSQ', type: 'RE申请单' },
        { prefix: '-AR', type: '应收单' },
        { prefix: '-AP', type: '应付单' },
        { prefix: '-ZD', type: '重点项目管控表' },
        { prefix: 'BZ-', type: '品质扣款申请' },
    ];
    function isMatch(docName: string, patternOrStr: string | RegExp) {
        if(patternOrStr instanceof RegExp) {
            return patternOrStr.test(docName);
        }

        return docName.startsWith(patternOrStr);
    }
    function getDocType(docNum: string) {
        docNum = docNum.replace(/^(?:SZ|HZ|YN|TJ|SH|SC|SU|XY|SX|RH|JK|SR|DG)(?=-)/, '');

        for (const item of typeMap) {
            if(!isMatch(docNum, item.prefix)) {
                continue;
            }
            return item.type;
        }
        return '';
    }

    function queryDocType(docNum: string) {
        const docType = getDocType(docNum.trim());
        if( docType ) {
            result = docType;
        } else {
            result = '未知单据类型，请联系管理员添加！';
        }
    }
</script>

<h1 class="text-3xl font-semibold text-center mb-5">根据单号查询单据类型</h1>
<Input 
    class="w-full"
    placeholder="输入单号"
    bind:value={docNo}
/>

<div class="mt-5">
    <div class="mt-3 p-3 bg-gray-100 rounded text-sm">
        {#if result}
                <p class="text-muted-foreground">{result}</p>
        {:else}
                <p class="text-muted-foreground">请输入单号</p>
        {/if}
    </div>
</div>

