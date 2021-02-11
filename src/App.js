import React, {Component} from 'react';
import './App.css';
import ImageUploader from "react-images-upload";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit,faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {Modal,ModalBody,ModalFooter,ModalHeader,Card,Col,CardImg,CardBody,CardSubtitle,CardTitle,
  CardText,CardDeck,Row,Container,Navbar,Nav,NavbarBrand,NavItem,NavLink,NavbarText} from 'reactstrap';
import  UserPool from './UserPool';
import  {CognitoUser,AuthenticationDetails} from 'amazon-cognito-identity-js';
import env from "react-dotenv";

// URL del API gateway del back
const urlCrud=env.API_ENDPOINT_CRUD;
// URL del API gateway para cargar las imagenes
const urlImagenS3=env.API_ENDPOINT_IMG;
// nombre de la base de datos Dynamo DB
const tablename= env.TABLE_NAME;

// Componente 
class App extends Component{
  // Estados de la clase
  state={
    data:[],
    modalInsertar: false, 
    modalEliminar: false,
    modalLogin: true,
    modalSignUp: false,
    modalNestedRegister: false,
    modalNestedLogin: false,
    form:{
      id:"",
      descripcion:"",
      precio:0,
      nombre:"",
      imagenUrl:"",
    },
    tipoModal:"",
    imagenProducto: [],
    // Variables de estado que guardan la informacion de logeo
    email:"",
    password:"",
    statusRegistro:false,
    cambioImgReciente:false,
  }
  //Funciones de estado que modifican la informacion de logeo
  setEmail = (pEmail)=>{ this.email = pEmail};
  setPassword = (pPassword)=> {this.password = pPassword};
  // Actualiza la img del producto
  setImage=(p1)=>{
    this.setState({
      imagenProducto: p1,
      cambioImgReciente: true,
    });
  }
  //Funcion para registrar usuario
  registrarUsuario = ()=>{
    UserPool.signUp(this.state.email,this.state.password,[],null,(err,data)=>{
      if(err) console.error(err);
      else{ this.setState({statusRegistro:true})};
      this.toggleModalNestedRegister();
    })
  };
  //Funcion para realizar el login de un usuario
  loginUsuario = ()=>{
      const user = new CognitoUser({
        Username: this.state.email,
        Pool: UserPool
      });
      const authDetails = new AuthenticationDetails({
        Username: this.state.email,
        Password: this.state.password
      });

      user.authenticateUser(authDetails,{
        onSuccess: data=>{
          this.toggleModalLogin();
        },
        onFailure: err => {
          console.error('onFailure:',err);
          this.toggleModalNestedLogin();
        },
        newPasswordRequired: data =>{
          console.log('newPasswordRequired:',data);
        }
      })
  }
  // Metodo que trae todos los productos del back
  getProductos=()=>{
    axios.post(urlCrud,{
      "operation": "list",
      "tableName": tablename,
      "payload": {}
     }).then(response=>this.setState({data: response.data.Items}))
     .catch(error => console.log(error.message));
  }
  //Metodo que carga una imagen en un bucket s3
  uploadProductoImg = async()=>{
    let file = this.state.imagenProducto[0];
    // Divida el nombre del archivo para obtener el nombre y el tipo
    if(file){
    let fileParts = file.name.split('.');
    var fileName = fileParts[0];
    var fileType = fileParts[1];
    }
    // Pregunta si se actualiza o no la imagen del producto, en caso de que sea un producto nuevo 
    // o se deba actualizar la imagen se hace el proceso de subir la imagen al bucket
    if((this.state.form.imagenUrl===undefined)||((this.state.form.imagenUrl.split("/")[3]!=fileName)&&(this.state.cambioImgReciente))){
      axios.post(urlImagenS3,{
        "fileName" : fileName,
        "fileType" : fileType
      })
      .then(response=>{
        var returnData = JSON.parse(response.data).data.returnData;
        var signedRequest = returnData.signedRequest;
        var url = returnData.url;
        this.setState({
          form:{
            id:this.state.form.id,
            descripcion:this.state.form.descripcion,
            precio:this.state.form.precio,
            nombre:this.state.form.nombre,
            imagenUrl:url
          }
        });
        // Colocar el tipo de archivo en los encabezados para la carga
        var options = { headers: { 'Content-Type': fileType, 'x-amz-acl': 'public-read' } }
        axios.put(signedRequest,file,options)
        .then(result => {
          console.log("Response from s3");
          this.state.tipoModal === 'insertar'?this.postProducto():this.putProducto();
          this.state.cambioImgReciente=false;
        })
        .catch(error => {
          alert("ERROR " + JSON.stringify(error));
        })
      }).catch(error => {
        alert(JSON.stringify(error));
      });
    }
    else{
        this.putProducto();
    }
  }
  // Metodo que crea un producto
  postProducto= async()=>{
    this.state.form.id=(this.state.data.length+1)+"";
    let peticion = {
      "operation": "create",
      "tableName": tablename,
      "payload": {
          "Item": this.state.form
      }
    }
    await axios.post(urlCrud,peticion).then(response=>{
      this.toggleModalInsertar();
      this.getProductos();
    }).catch(error =>{ console.log(error.message)});
  };
  // Metodo que actualiza un producto
  putProducto=async()=>{
    let peticion = {
      "operation": "create",
      "tableName": tablename,
      "payload": {
          "Item": this.state.form
      }
    }
    await axios.post(urlCrud,peticion).then(response=>{
      console.log(response);
      this.toggleModalInsertar();
      this.getProductos();
    }).catch(error =>{ console.log(error.message)});
  }
  //Metodo que elimina un producto
  deleteProducto=async()=>{
    let peticion = {
      "operation": "delete",
      "tableName": tablename,
      "payload": {"Key":
              { "id": this.state.form.id}
          }
        }
    await axios.post(urlCrud,peticion).then(response=>{
      this.toggleModalEliminar();
      this.getProductos();
    }).catch(error =>{ console.log(error.message)});
  }
  //Metodo que se ejecuta inmediatamente el componente es cargado
  componentDidMount(){
      this.getProductos();
  }
  // Cambia de true a false y viceversa el booleano modalInsertar
  toggleModalInsertar=()=>{
    this.setState({modalInsertar:!this.state.modalInsertar})
  }
  // Cambia de true a false y viceversa el booleano modalEliminar
  toggleModalEliminar=()=>{
    this.setState({modalEliminar:!this.state.modalEliminar})
  }
  // Cambia de true a false y viceversa el booleano modalSignUp
  toggleModalSignUp=()=>{
    this.setState({modalSignUp:!this.state.modalSignUp})
  }
   // Cambia de true a false y viceversa el booleano modalLogin
  toggleModalLogin=()=>{
    this.setState({modalLogin:!this.state.modalLogin})
  }
  // Cambia de true a false y viceversa el booleano modalNestedRegister
  toggleModalNestedRegister=()=>{
    this.setState({modalNestedRegister:!this.state.modalNestedRegister})
  }
  // Cambia de true a false y viceversa el booleano modalNestedRegister
  toggleModalNestedLogin=()=>{
    this.setState({modalNestedLogin:!this.state.modalNestedLogin})
  }
  // Permite guardar en el estado de form el producto que fue seleccionado por la persona
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
  // Permite actualizar los cambios en tiempo real del formulario que es llenado por el cliente
  handleChange=async e=>{
    e.persist();
    await this.setState({
      form:{
        ...this.state.form,
        [e.target.name]: e.target.value
      }
    });
  }
  // Permite actualizar los cambios en tiempo real del formulario de login o register que es llenado por el cliente
  handleChangeLogin=async e=>{
    e.persist();
    await this.setState({
        ...this.state,
        [e.target.name]: e.target.value
    });
  }
  // Renderiza toda la aplicacion
  render(){
    const {form} = this.state;
  return(
      <div className="App">
        <Navbar color="dark" dark expand="md">
        <NavbarBrand href="/">Tienda</NavbarBrand>
          <Nav className="mr-auto" navbar>
            <NavItem>
              <NavLink href="https://github.com/natobo/Front-react-crud-tienda">GitHub</NavLink>
            </NavItem>
          </Nav>
          <NavbarText>Logout</NavbarText>
      </Navbar>

      <br/>
      <button className="btn btn-success" onClick={() =>{this.setState({form:null,tipoModal:'insertar'}); this.toggleModalInsertar()}}>Agregar Producto</button>
      <br/><br/>
        <Container>
          <Row>
            <CardDeck>
              {this.state.data.map(producto =>{
                  return(
                    <Col sm="3">
                      <Card style={{ width: '18rem' }} >
                        <CardImg variant="top" src={producto.imagenUrl}  width="50%" />
                        <CardBody>
                          <strong><CardTitle>{producto.nombre}</CardTitle></strong>
                          <CardSubtitle className="mb-2 text-muted">{new Intl.NumberFormat("en-EN").format(producto.precio)}</CardSubtitle>
                          <CardText>
                            {producto.descripcion}
                          </CardText>
                          <button className="btn btn-primary" onClick={()=>{this.seleccionarProducto(producto);this.toggleModalInsertar()}}> <FontAwesomeIcon icon={faEdit}/> </button>
                          <button className="btn btn-danger"  onClick={()=>{this.seleccionarProducto(producto);this.toggleModalEliminar()}}> <FontAwesomeIcon icon={faTrashAlt}/> </button>
                        </CardBody>  
                      </Card>
                    </Col>
                  )
              })}
            </CardDeck>
          </Row>
        </Container>

          <Modal isOpen={this.state.modalInsertar}>
            <ModalHeader style={{display:'block'}}>
              <button className="btn btn-danger" style={{float: 'right'}} onClick={() => this.toggleModalInsertar()}>X</button>
            </ModalHeader>
            <ModalBody>
              <div className="form-group">
                <label htmlFor="id">Id</label>
                <input className="form-control" type="string" name="id" id="id" readOnly onChange={this.handleChange} value={form?form.id:this.state.data.length+1}/>
                <br/>
                <label htmlFor="nombre">Nombre</label>
                <input className="form-control" type="text" name="nombre" id="nombre" onChange={this.handleChange} value={form?form.nombre:''}/>
                <br/>
                <label htmlFor="precio">Precio</label>
                <input className="form-control" type="number" name="precio" id="precio" onChange={this.handleChange} value={form?form.precio:0}/>
                <br/>
                <label htmlFor="descripcion">Descripción</label>
                <input className="form-control" type="text" name="descripcion" id="descripcion" onChange={this.handleChange} value={form?form.descripcion:''}/>
                <br/>
                <label htmlFor="productoImgFile">{ this.state.tipoModal === 'insertar'?"Subir imagen":"Actualizar imagen"}</label>
                <ImageUploader 
                        key="image-uploader"
                        withIcon={true}
                        singleImage={true}
                        withPreview={true}
                        label="Tamaño máximo de archivo: 5MB"
                        buttonText="Elige una imagen"
                        imgExtension={[".jpg",".png",".jpeg",".gif"]}
                        maxFileSize={5242880}
                        className="ImgProducto"
                        onChange={this.setImage}>
                </ImageUploader>
              </div>
            </ModalBody>
            <ModalFooter>
              { this.state.tipoModal === 'insertar'?
              <button className="btn btn-success" onClick={()=>this.uploadProductoImg()}>
                Insertar
              </button>: <button className="btn btn-primary" onClick={()=>this.uploadProductoImg()}>
                Actualizar
              </button>
              }
              <button className="btn btn-danger" onClick={()=>this.toggleModalInsertar()}>
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
              <button className="btn btn-primary" onClick={()=>this.toggleModalEliminar()}>No</button>
            </ModalFooter>
          </Modal>
          <Modal isOpen={this.state.modalLogin}>
            <ModalHeader style={{display:'block'}}>
              <strong><p>Login</p></strong>
            </ModalHeader>
            <ModalBody>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input className="form-control" type="text" name="email" id="email" onChange={this.handleChangeLogin} value={this.state.email}/>
                <br/>
                <label htmlFor="password">Contraseña</label>
                <input className="form-control" type="password" name="password" id="password" onChange={this.handleChangeLogin} value={this.state.password}/>
                <br/>
              </div>
              <Modal isOpen={this.state.modalNestedLogin}>
                 <ModalHeader>{'Error login'}</ModalHeader>
                 <ModalBody>{'correo electronico o contraseña incorrecta'}</ModalBody>
                 <ModalFooter>
                     <button className="btn btn-danger" onClick={()=>{this.toggleModalNestedLogin()}}>Ok</button>
                 </ModalFooter>
             </Modal>
            </ModalBody>
            <ModalFooter>
              <button className="btn btn-primary" onClick={()=>{this.toggleModalLogin();this.toggleModalSignUp()}}>Registrarse</button>
              <button className="btn btn-success" onClick={()=>{this.loginUsuario()}}>Login</button>
            </ModalFooter>
          </Modal>
          <Modal isOpen={this.state.modalSignUp}>
            <ModalHeader style={{display:'block'}}>
              <strong><p>Registrarse</p></strong>
            </ModalHeader>
            <ModalBody>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input className="form-control" type="text" name="email" id="email" onChange={this.handleChangeLogin} value={this.state.email}/>
                <br/>
                <label htmlFor="password">Contraseña</label>
                <input className="form-control" type="password" name="password" id="password" onChange={this.handleChangeLogin} value={this.state.password}/>
                <br/>
              </div>
              <Modal isOpen={this.state.modalNestedRegister}>
                 <ModalHeader>{this.state.statusRegistro?'Registro exitoso':'Error en el registro'}</ModalHeader>
                 <ModalBody>{this.state.statusRegistro?'Por favor espere a que uno de los administradores confirme su cuenta, sera avisado por correo electronico':'Revisar el correo electronico y la contraseña (debe tener 8 caracteres como mínimo)'}</ModalBody>
                 <ModalFooter>
                     <button className={this.state.statusRegistro?"btn btn-success":"btn btn-danger"} onClick={()=>{this.toggleModalNestedRegister()}}>Ok</button>
                 </ModalFooter>
             </Modal>
            </ModalBody>
            <ModalFooter>
               <button className="btn btn-primary" onClick={()=>{this.toggleModalLogin();this.toggleModalSignUp()}}>Volver a login</button>
               <button className="btn btn-success" onClick={()=>{this.registrarUsuario()}}>Registrarse</button>
            </ModalFooter>
          </Modal>
      </div>
    ); 
  }

}
export default App;
