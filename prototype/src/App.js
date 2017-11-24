import React, { Component } from 'react';
import {
    Navbar, Nav, NavbarBrand, ButtonDropdown,
    DropdownToggle, DropdownMenu, Input,
    InputGroup, Button, InputGroupButton,
    Card, CardTitle, CardText, Collapse,
    ListGroup, ListGroupItem, ButtonGroup,
    DropdownItem, Modal, ModalHeader,
    ModalBody, ModalFooter, Container,
    Row, Col, CardHeader, CardBody,
    ListGroupItemHeading,
} from 'reactstrap';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragSource, DragDropContext, DropTarget } from 'react-dnd';
import 'bootstrap/dist/css/bootstrap.css';
import _ from 'lodash';

const itemsAvailable = [...Array(200).keys()].map(k => {
    return {
        name: `Item ${k}`,
        price: Math.round(1000*Math.random())/100,
    };
});

const ItemType = Symbol('ItemType');

const filterOptions = {
    price: {name: 'Price', up: true },
};

const Item = DragSource(
        ItemType,
        { beginDrag(props){ return props.item; } },
        (connect, monitor) => { return {connectDragSource: connect.dragSource()}; })(
    (props) => {
        const {connectDragSource, item, onClick} = props;
        const onDelete = props.onDelete || false;
        return connectDragSource(
            <div>
            <Card body>
                <a onClick={onClick}>
                    <CardTitle>
                        { onDelete ? (<Button className="close" onClick={onDelete}>
                            <span aria-hidden="true">&times;</span>
                        </Button>) : '' }
                        {item.name}
                    </CardTitle>
                    <CardText> {`Price: ${item.price}`} </CardText>
                </a>
            </Card>
            </div>
        );
    });

const List = DropTarget(
        ItemType,
        {drop(props, monitor, component){
            const item = monitor.getItem();
            props.onItemAdded(item);
        }},
        (connect, monitor) => { return {connectDropTarget: connect.dropTarget()}; })(
    (props) => {
        const {
            connectDropTarget, list, onToggleCollapse, onDelete,
            onNameChange, onDeleteItem
        } = props;
        return connectDropTarget(<div>
            <ListGroupItem>
                <ListGroupItemHeading>
                    <InputGroup>
                    <Input type="text" value={list.name} onChange={onNameChange}/>
                    <InputGroupButton onClick={onToggleCollapse}>
                        {list.show ? '-' : '+'}
                    </InputGroupButton>
                    <InputGroupButton className="close" onClick={onDelete}>
                        <span aria-hidden="true">&times;</span>
                    </InputGroupButton>
                    </InputGroup>
                </ListGroupItemHeading>
                <Collapse isOpen={list.show}>
                {
                    list.items.length === 0 ? (<p className="text-muted">Drag items here to add them to the list.</p>)
                        : list.items.map( (item, j) => (
                        <Item
                            item={item}
                            key={j}
                            onClick={()=>{}}
                            onDelete={() => onDeleteItem(j)} />
                    ))
                }
                </Collapse>
            </ListGroupItem>
        </div>);
    });
        

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            displayFilter: false,
            searchTerm: null,
            filters: [],
            modals: itemsAvailable.reduce((acc, item) => {
                acc[item.name] = false;
                return acc;
            }, {}),
            lists: [],
            showLists: false,
        };
    }
    render() {
        return (
        <div>
            <Navbar color="success" className="sticky-top" style={{minHeight: '4rem'}}>
                <NavbarBrand className="text-dark" href="/">Save on Foods</NavbarBrand>
                <Nav navbar>
                        <InputGroup>
                            <Input type="text" id="search" placeholder="Search" onChange={ev => this.setState({searchTerm: ev.target.value})}/>
                            <InputGroupButton>
                                <ButtonDropdown isOpen={this.state.displayFilter} toggle={() => this.setState({displayFilter: !this.state.displayFilter})}>
                                    <DropdownToggle caret>Filter</DropdownToggle>
                                    <DropdownMenu right>
                                        <DropdownItem header>
                                            <Input type="select" className="w-100" name="select" value="default" id="add-filter" onChange={e =>{
                                                let value = e.target.value;
                                                let opt = filterOptions[value];
                                                this.setState({
                                                    filters: [{key: value, up: opt.up, name: opt.name}]
                                                        .concat(this.state.filters)
                                                })
                                            }}>
                                                <option key="default" value="default">Add filter...</option>
                                            {
                                                Object.keys(filterOptions).map( k => (
                                                    <option key={k} value={k}>{filterOptions[k].name}</option>
                                                ))
                                            }
                                            </Input>
                                        </DropdownItem>
                                        <DropdownItem divider />
                                        <ListGroup>
                                        {
                                            this.state.filters.map( (f, i) => (
                                                <ListGroupItem disabled key={i}>
                                                    <Button className="close float-left" onClick={ () => {
                                                        let filters = this.state.filters.slice();
                                                        filters.splice(i, 1);
                                                        this.setState({filters: filters});
                                                    }}><span aria-hidden="true">&times;</span></Button>
                                                    {' '}{f.name}{' '}
                                                    <ButtonGroup size="xs">
                                                        <Button active={f.up} onClick={() => {
                                                            let filters = this.state.filters.slice();
                                                            filters[i].up = true;
                                                            this.setState({filters: filters});
                                                        }}>Ascending</Button>
                                                        <Button active={!f.up} onClick={() => {
                                                            let filters = this.state.filters.slice();
                                                            filters[i].up = false;
                                                            this.setState({filters: filters});
                                                        }}>Descending</Button>
                                                    </ButtonGroup>
                                                </ListGroupItem>
                                           ) )
                                        }
                                        </ListGroup>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            </InputGroupButton>
                        </InputGroup>
                </Nav>
            </Navbar>
            <Container fluid><Row>
            <Col
                md={this.state.showLists? 3:12}
                className="sticky-top"
                style={{top:'4rem', 'max-height': this.state.showLists?'calc(100vh - 4rem)':undefined}}
                >
                <Card style={{'height': this.state.showLists?'100%':undefined}}>
                    <CardHeader>
                        <h3>Shopping Lists{'  '}
                        <Button size="sm" onClick={()=>{
                            this.setState({showLists: !this.state.showLists});
                        }}>
                            {this.state.showLists? 'Hide Lists' : 'Show Lists'}
                        </Button>
                        <Button size="sm" onClick={()=>{
                            this.setState({
                                lists: [{
                                    name: 'New List',
                                    items: [],
                                    show: true,
                                }].concat(this.state.lists),
                                showLists: true
                            });
                        }}>
                            New List
                        </Button>
                        </h3>
                    </CardHeader>
                    <Collapse isOpen={this.state.showLists} style={{'max-height': '100%', 'overflow-y': 'auto'}}>
                    <CardBody>
                        <ListGroup>
                        {
                            this.state.lists.length === 0 ? (<p className="text-muted">Click "New List" to add one</p>)
                            : this.state.lists.map( (list, i) => (
                                <List
                                    key={i}
                                    list={list}
                                    onToggleCollapse={()=>{
                                        let lists = this.state.lists.slice();
                                        lists[i].show = !list.show;
                                        this.setState({lists: lists});
                                    }}
                                    onNameChange={e=>{
                                        let lists = this.state.lists.slice();
                                        lists[i].name = e.target.value;
                                        this.setState({lists: lists});
                                    }}
                                    onDelete={()=>{
                                        let lists = this.state.lists.slice();
                                        lists.splice(i, 1);
                                        this.setState({lists: lists});
                                    }}
                                    onDeleteItem={j=>{
                                        let lists = this.state.lists.slice();
                                        lists[i].items.splice(j, 1);
                                        this.setState({lists: lists});
                                    }}
                                    onItemAdded={item=>{
                                        let lists = this.state.lists.slice();
                                        lists[i].items.unshift(item);
                                        this.setState({lists: lists});
                                    }} />
                            ))
                        }
                        </ListGroup>
                    </CardBody>
                    </Collapse>
                </Card>
            </Col>
            <Col md={this.state.showLists? 9:12}>
            <main>
                { _.chunk(this.state.filters.reduce((acc, filter) =>
                            acc.sort((a, b) => 
                                filter.up ?
                                    a[filter.key] - b[filter.key]
                                    : b[filter.key] - a[filter.key]
                            )
                        ,
                        itemsAvailable.slice())
                    .filter( item => !this.state.searchTerm || item.name.includes(this.state.searchTerm) ), 4)
                    .map( (chunk, i) => (
                        <Row key={i}>
                        {chunk.map( item => (
                            <Col key={item.name} md="3">
                            <Item key={item.name} item={item} onClick={() => {
                                let modals = this.state.modals;
                                modals[item.name] = true;
                                this.setState({modals: modals});
                            }} />
                            </Col>
                        )) }
                        </Row>
                    ))
                }
            </main>
            </Col>
            </Row></Container>
            {
                itemsAvailable.map( item => (
                    <Modal key={item.name+'modal'} isOpen={this.state.modals[item.name]} toggle={()=>{
                        let modals = this.state.modals;
                        modals[item.name] = !modals[item.name];
                        this.setState({modals: modals});
                    }}>
                        <ModalHeader>{item.name}</ModalHeader>
                        <ModalBody>insert lorem ipsum here</ModalBody>
                        <ModalFooter>
                            <Button onClick={()=>{
                                let modals = this.state.modals;
                                modals[item.name] = false;
                                this.setState({modals: modals});
                            }}> Close </Button>
                        </ModalFooter>
                    </Modal>
                ))
            }
        </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(App);
