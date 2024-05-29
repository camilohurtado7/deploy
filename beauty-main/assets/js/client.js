// Espera a que el documento HTML esté completamente cargado antes de ejecutar el código
 $(document).ready(function() {
//     // Asigna un evento de clic al elemento con id 'loginLink'
    // Asigna un evento de envío al formulario con id 'loginForm'
    $('#loginForm').submit(function(event) {
        //event.preventDefault(); // Previene el comportamiento por defecto del formulario
        // Obtiene los valores de los campos de entrada
        let email = $('#email').val();
        let clave = $('#clave').val();

        // Realiza una solicitud POST al servidor con los datos de inicio de sesión
        $.post('/login', { email: email, clave: clave }, function(response) {
            // Verifica si el usuario existe en la respuesta del servidor
            if (response.exists) {
                // Redirige a la página de inicio
                window.location.href = '/inicio';
            } else {
                // Muestra un mensaje de error utilizando la librería Swal
                Swal.fire('Correo no encontrado', 'El correo no existe o la clave es incorrecta.', 'error');
            }
        });
    });

    // Asigna un evento de envío al formulario con id 'registerForm'
    $('#registerForm').submit(function(event) {
        event.preventDefault(); // Previene el comportamiento por defecto del formulario
        // Obtiene los valores de los campos de entrada
        let nombre = $('#name').val();
        let email = $('#email').val();
        let contraseña = $('#password').val();
        
        // Realiza una solicitud AJAX al servidor para registrar un nuevo usuario
        $.ajax({
            url: '/register',
            type: 'POST',
            data: { nombre: nombre, email: email, contraseña: contraseña },
            // Función a ejecutar si la solicitud es exitosa
            success: function(response) {
                // Verifica si el usuario se registró correctamente
                if (response.registered) {
                    // Muestra un mensaje de éxito utilizando la librería Swal
                    Swal.fire('Registro exitoso', '¡Correo registrado correctamente!', 'success').then(() => {
                        // Redirige a la página de inicio de sesión después de que se cierre el mensaje de éxito
                        window.location.href = '/login';
                    });
                } else {
                    // Muestra un mensaje de error utilizando la librería Swal
                    Swal.fire('Error', 'La creación del correo falló', 'error');
                }
            },
            // Función a ejecutar si hay un error en la solicitud
            error: function(xhr, status, error) {
                // Muestra un mensaje de error utilizando la librería Swal
                Swal.fire('Error', 'El correo ya está registrado.', 'error');
            }
        });
    });
});
