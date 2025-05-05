import {Form, Input, Modal, TreeSelect} from "antd";
import React, {useCallback, useEffect, useRef, useState} from "react";
import storage from "@/storage.ts";
import {v4 as uuidV4} from "uuid";
import {anyParams, AppStoreType} from "@/types";
import {inject, observer} from "mobx-react";

interface PropsType{
    visible: boolean;
    onClose: () => void;
    onSave: (data:any) => void;
    data: anyParams;
    appStore?: AppStoreType;
}
const SpaceDetail:React.FC<PropsType> = (props) => {
    const {data, appStore} = props;
    const {setProperty} = appStore!;
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const [spaces, setSpaces] = useState([]);
    const oldInfo = useRef({} as anyParams);

    const getTreeData = async ()=>{
        let spaces = await storage.get(storage.SPACE)||[];
        spaces = [
            {
                id: '',
                name: '工作空间',
                children: spaces
            }
        ]
        let spaceParentId = data.parentId||'';
        if(!data.id && !spaceParentId) spaceParentId = spaces?.[0]?.id||'';
        function replaceSpaces(datas:any[], parentId:string){
            datas.forEach(item=>{
                item.key = item.id;
                item.title = item.name;
                item.value = item.id;
                if(!spaceParentId && data?.id && item.id===data?.id){
                    spaceParentId = parentId;
                }
                if(item?.children?.length){
                    replaceSpaces(item.children, item.id)
                    item.children = item.children.filter(item=>item.id!==data?.id)
                }
            })
        }
        if(data?.id){
            spaces = spaces.filter(item=>item.id!==data.id)
        }
        replaceSpaces(spaces, '')
        setSpaces(spaces)
        await form.setFieldsValue({
            space: spaceParentId
        })
        oldInfo.current.space = [spaceParentId];
    }

    useEffect(() => {
        if (props.visible && props.visible !== visible) {
            setVisible(true)
            form.resetFields();
            form.setFieldsValue({
                name: data?.name||''
            })
            oldInfo.current = {
                name: data?.name||''
            }
            getTreeData()
        }
    }, [props.visible, visible, form, data]);


    const onSave = useCallback(async () => {
        const {errorFields=[]} = await form.validateFields()
        if(errorFields.length){
            return;
        }
        const formData = form.getFieldsValue();
        const {name, space} = formData;
        const spaces = await storage.get(storage.SPACE) || [];
        let newSpaces = [];
        const isChangeParent = (space?.[0]||'')!=(oldInfo.current.space?.[0]||'');
        if(data.id && !isChangeParent){
            newSpaces = spaces.map(item=>{
                if(item.id===data.id){
                    item.name = name
                }
                return item;
            })
        }else if(data.id && isChangeParent){
            function removeNode(datas:any[]){
                datas.forEach(item=>{
                    if(item.id===oldInfo.current.space?.[0]){
                        item.children = item.children.filter(item=>item.id!==data.id)
                    }
                })
            }
            removeNode(spaces)
        }
        if(!data.id || isChangeParent){
            const addId = data?.id || uuidV4();
            if(space){
                function addNode(items){
                    return items.map(item=>{
                        if(item.id===space){
                            item.children = [...(item.children||[]), {id: addId, name}]
                        }else if(item.children?.length){
                            item.children = addNode(item.children)
                        }
                        return item;
                    })
                }
                newSpaces = addNode(spaces)
            }else {
                newSpaces = [...spaces, {id:addId, name}]
            }
            setProperty({selectSpace: [addId]})
        }

        await storage.set("space", newSpaces)
        props.onSave(formData)
        onClose()
    }, [data, props.onSave])

    const onClose = useCallback(() => {
        props.onClose();
        setVisible(false)
    }, [props.onClose])
    return (
        <Modal
            title={`${data?.id?"编辑":"新建"}工作空间`}
            open={visible}
            onOk={onSave}
            onCancel={onClose}
        >
            <Form
                name="SpaceDetail"
                labelCol={{span: 6}}
                wrapperCol={{span: 18}}
                style={{maxWidth: 600}}
                initialValues={{remember: true}}
                autoComplete="off"
                form={form}
            >
                <Form.Item
                    label="工作空间"
                    name="space"
                >
                    <TreeSelect treeData={spaces} allowClear multiple={false} treeDefaultExpandAll/>
                </Form.Item>
                <Form.Item
                    label="空间名称"
                    name="name"
                    rules={[{required: true, message: '请输入空间名称'}]}
                >
                    <Input placeholder="请输入空间名称"/>
                </Form.Item>
            </Form>
        </Modal>
    )
}
export default inject("appStore")(observer(SpaceDetail));