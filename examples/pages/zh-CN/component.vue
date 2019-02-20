<template>
    <div class="page-container page-component">
        <div class="page-component__content">
            <router-view class="content"></router-view>
        </div>
    </div>
</template>

<script>
    export default {
        name: "components"
    }
</script>

<style lang="scss">
    .page-component {
        box-sizing: border-box;
        height: 100%;
        &.page-container {
            padding: 0;
        }
        .page-component__content {
            padding-left: 270px;
            padding-bottom: 100px;
            box-sizing: border-box;
        }

        .content {
            padding-top: 50px;
            > {
                h3 {
                    margin: 55px 0 20px;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                    background-color: #fff;
                    font-size: 14px;
                    margin-bottom: 45px;
                    line-height: 1.5em;

                    strong {
                        font-weight: normal;
                    }

                    td, th {
                        border-bottom: 1px solid #dcdfe6;
                        padding: 15px;
                        max-width: 250px;
                    }

                    th {
                        text-align: left;
                        white-space: nowrap;
                        color: #909399;
                        font-weight: normal;
                    }

                    td {
                        color: #606266;
                    }

                    th:first-child, td:first-child {
                        padding-left: 10px;
                    }
                }
                ul:not(.timeline) {
                    margin: 10px 0;
                    padding: 0 0 0 20px;
                    font-size: 14px;
                    color: #5e6d82;
                    line-height: 2em;
                }
            }
        }

        .page-component-up {
            background-color: #fff;
            position: fixed;
            right: 100px;
            bottom: 150px;
            size: 40px;
            border-radius: 20px;
            cursor: pointer;
            transition: .3s;
            box-shadow: 0 0 6px rgba(0,0,0, .12);
            z-index: 5;
            i {
                color: #409EFF;
                display: block;
                line-height: 40px;
                text-align: center;
                font-size: 18px;
            }

            &.hover {
                opacity: 1;
            }
        }
        .back-top-fade-enter,
        .back-top-fade-leave-active {
            transform: translateY(-30px);
            opacity: 0;
        }
    }

    @media (max-width: 768px) {
        .page-component {
            .page-component__nav {
                width: 100%;
                position: static;
                margin-top: 0;
            }
            .side-nav {
                padding-top: 0;
                padding-left: 50px;
            }
            .page-component__content {
                padding-left: 10px;
                padding-right: 10px;
            }
            .content {
                padding-top: 0;
            }
            .content > table {
                overflow: auto;
                display: block;
            }
            .page-component-up {
                display: none;
            }
        }
    }
</style>