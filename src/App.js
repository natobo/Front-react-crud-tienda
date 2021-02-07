import React, {Component} from 'react';
import './App.css';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit,faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {Modal,ModalBody,ModalFooter,ModalHeader} from 'reactstrap';


const url="https://nouglttpu1.execute-api.us-east-1.amazonaws.com/Prod/Lambda_api-lambda-db-tiendaback-nicotobo";

class App extends Component{
  state={
    data:[],
    modalInsertar: false, 
    modalEliminar: false,
    form:{
      id:"",
      descripcion:"",
      precio:0,
      nombre:"",
      imagenUrl:"",
    },
    tipoModal:""
  }
  getProductos=()=>{
    axios.post(url,{
      "operation": "list",
      "tableName": "Dynamo_api-lambda-db-tiendaback-nicotobo",
      "payload": {}
     }).then(response=>this.setState({data: response.data.Items}))
     .catch(error => console.log(error.message));
  }
  postProducto= async()=>{
    this.state.form.id=(this.state.data.length+1)+"";
    let peticion = {
      "operation": "create",
      "tableName": "Dynamo_api-lambda-db-tiendaback-nicotobo",
      "payload": {
          "Item": this.state.form
      }
    }
    await axios.post(url,peticion).then(response=>{
      console.log(response);
      this.funModalInsertar();
      this.getProductos();
    }).catch(error =>{ console.log(error.message)});
  }
  putProducto=async()=>{
    let peticion = {
      "operation": "create",
      "tableName": "Dynamo_api-lambda-db-tiendaback-nicotobo",
      "payload": {
          "Item": this.state.form
      }
    }
    await axios.post(url,peticion).then(response=>{
      console.log(response);
      this.funModalInsertar();
      this.getProductos();
    }).catch(error =>{ console.log(error.message)});
  }
  deleteProducto=async()=>{
    let peticion = {
      "operation": "delete",
      "tableName": "Dynamo_api-lambda-db-tiendaback-nicotobo",
      "payload": {"Key":
              { "id": this.state.form.id}
          }

        }
    await axios.post(url,peticion).then(response=>{
      console.log(response);
      this.funModalEliminar();
      this.getProductos();
    }).catch(error =>{ console.log(error.message)});
  }
  componentDidMount(){
      this.getProductos();
  }
  funModalInsertar=()=>{
    this.setState({modalInsertar:!this.state.modalInsertar})
  }
  funModalEliminar=()=>{
    this.setState({modalEliminar:!this.state.modalEliminar})
  }
  seleccionarProducto=(producto)=>{
    this.setState({
      tipoModal:'actualizar',
      form:{
        id: producto.id,
        descripcion: producto.descripcion,
        precio: producto.precio,
        nombre: producto.nombre,
        imagenUrl: producto.imagenUrl
      }
    })
  }
  handleChange=async e=>{
    e.persist();
    await this.setState({
      form:{
        ...this.state.form,
        [e.target.name]: e.target.value
      }
    });
  }
  render(){
    const {form} = this.state;
  return(
      <div className="App">
        <br/>
        <button className="btn btn-success" onClick={() =>{this.setState({form:null,tipoModal:'insertar'}); this.funModalInsertar()}}> Agregar Producto</button>
        <br/><br/>
        <table className="table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Nombre</th>
              <th>Descripcion</th>
              <th>Precio</th>
              <th>ImagenUrl</th>
              <th>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {this.state.data.map(producto =>{
              return(
                <tr>
                  <td>{producto.id}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.descripcion}</td>
                  <td>{new Intl.NumberFormat("en-EN").format(producto.precio)}</td>
                  <td>{producto.imagenUrl}</td>
                  <td>
                      <button className="btn btn-primary" onClick={()=>{this.seleccionarProducto(producto);this.funModalInsertar()}}> <FontAwesomeIcon icon={faEdit}/> </button>
                      <button className="btn btn-danger"  onClick={()=>{this.seleccionarProducto(producto);this.funModalEliminar()}}> <FontAwesomeIcon icon={faTrashAlt}/> </button>
                  </td>
                </tr>
                )
            })}
          </tbody>
        </table>

          <Modal isOpen={this.state.modalInsertar}>
            <ModalHeader style={{display:'block'}}>
              <button className="btn btn-danger" style={{float: 'right'}} onClick={() => this.funModalInsertar()}>X</button>
            </ModalHeader>
            <ModalBody>
              <div className="form-group">
                <label htmlFor="id">id</label>
                <input className="form-control" type="string" name="id" id="id" readOnly onChange={this.handleChange} value={form?form.id:this.state.data.length+1}/>
                <br/>
                <label htmlFor="nombre">Nombre</label>
                <input className="form-control" type="text" name="nombre" id="nombre" onChange={this.handleChange} value={form?form.nombre:''}/>
                <br/>
                <label htmlFor="precio">Precio</label>
                <input className="form-control" type="number" name="precio" id="precio" onChange={this.handleChange} value={form?form.precio:0}/>
                <br/>
                <label htmlFor="descripcion">Descripcion</label>
                <input className="form-control" type="text" name="descripcion" id="descripcion" onChange={this.handleChange} value={form?form.descripcion:''}/>
                <br/>
                <label htmlFor="imagenUrl">Imagen Url</label>
                <input className="form-control" type="text" name="imagenUrl" id="imagenUrl" onChange={this.handleChange} value={form?form.imagenUrl:''}/>
              </div>
            </ModalBody>
            <ModalFooter>
              { this.state.tipoModal === 'insertar'?
              <button className="btn btn-success" onClick={()=>this.postProducto()}>
                Insertar
              </button>: <button className="btn btn-primary" onClick={()=>this.putProducto()}>
                Actualizar
              </button>
              }
              <button className="btn btn-danger" onClick={()=>this.funModalInsertar()}>
                Cancelar
              </button>
            </ModalFooter>
          </Modal>

          <Modal isOpen={this.state.modalEliminar}>
            <ModalBody>
              ¿Estás seguro que deseas eliminar el producto {form && form.nombre}?
            </ModalBody>
            <ModalFooter>
              <button className="btn btn-danger" onClick={()=>this.deleteProducto()}>Si</button>
              <button className="btn btn-primary" onClick={()=>this.funModalEliminar()}>No</button>
            </ModalFooter>
          </Modal>
      </div>
    ); 
  }

}
export default App;
